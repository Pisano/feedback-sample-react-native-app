# Pisano Feedback SDK — React Native Sample App

[![CI](https://github.com/Pisano/feedback-sample-react-native-app/actions/workflows/ci.yml/badge.svg)](https://github.com/Pisano/feedback-sample-react-native-app/actions/workflows/ci.yml)

A standalone React Native app showing how to integrate
**[feedback-react-native-sdk](https://www.npmjs.com/package/feedback-react-native-sdk)**
on iOS and Android. It installs the SDK from npm like a real integration — it is
not linked to the SDK source.

**SDK version:** `feedback-react-native-sdk` **^0.3.0**
(Android native `co.pisano:feedback:1.3.+`, iOS `Pisano ~> 1.0.21`).

The full API reference lives in the
[SDK README](https://github.com/Pisano/feedback-react-native-sdk#readme). This
file covers running the sample and the essentials.

## Requirements

| Tool | Version |
|------|---------|
| Node | **22.13+** (React Native 0.85–0.87 require it) |
| React Native | **0.87** (this app); the SDK supports **≥ 0.82** |
| JDK | 17 |
| Xcode | 16+, CocoaPods 1.16+ |
| Android SDK | API 37, build-tools 37 |

`feedback-react-native-sdk@0.3.x` is **New Architecture only**. React Native
≤ 0.81 must stay on `feedback-react-native-sdk@0.2.x`.

## Setup

```sh
yarn install     # copies src/pisano.config.example.ts -> src/pisano.config.ts (git-ignored)
```

Fill in `appId`, `accessKey`, `code` and the URLs in `src/pisano.config.ts` from
the Pisano panel — or type them into the form at runtime. `appId` / `accessKey`
are under **Profile → Mobile applications**; `apiUrl` / `feedbackUrl` / `code`
under **Mobile Channels → Deploy → Publish Channel Parameters**.

### iOS

```sh
cd ios && pod install && cd ..
yarn ios
```

### Android

```sh
yarn android
```

> Physical device over USB: `adb reverse tcp:8081 tcp:8081` first.

See [RUN_DEBUG.md](./RUN_DEBUG.md) for a full build/run walkthrough.

## SDK usage

All calls take a single options object and return a promise (the old positional
signatures still work but are `@deprecated`).

### Debug mode — call before boot

```ts
import { feedbackSDKDebugMode } from 'feedback-react-native-sdk';

feedbackSDKDebugMode(true);
// Android: adb logcat -s PISANO_SDK ReactNativeJS
// iOS:     Xcode console, filter "Pisano"
```

### Boot — once, on app start

```ts
import { feedbackSDKBoot, feedbackSDKCallback } from 'feedback-react-native-sdk';

const status = await feedbackSDKBoot({
  appId: 'YOUR_APP_ID',
  accessKey: 'YOUR_ACCESS_KEY',
  code: 'PSN-xxxxx',
  apiUrl: 'https://api.pisano.co',
  feedbackUrl: 'https://web.pisano.co/web_feedback',
  // eventUrl: 'https://events.pisano.co',   // optional
});

if (status !== feedbackSDKCallback.InitSuccess) {
  // Boot failed — feedbackSDKShow() will not open anything.
}
```

| Result | Meaning | What to do |
|--------|---------|------------|
| `InitSuccess` | initialized | proceed |
| `InitFailed` | bad credentials / wrong URL / TLS / network error | don't call `feedbackSDKShow`; turn on debug mode, retry on next launch |

### Show the widget

```ts
import { feedbackSDKShow, feedbackSDKViewMode } from 'feedback-react-native-sdk';

const result = await feedbackSDKShow({
  viewMode: feedbackSDKViewMode.BottomSheet,
  title: 'We value your feedback',
  language: 'en',
  dismissOnDrag: true,
  customer: { email: 'user@example.com', externalId: 'USR-42' },
  payload: { screenName: 'Checkout', orderId: 'ORD-987' },
});
```

Every field is optional. `customer` / `payload` accept a plain object or a
`Map`. Customer keys are camelCase (`name`, `email`, `phoneNumber`,
`externalId`, `customAttributes`); snake_case is also accepted.

### Handling the `feedbackSDKShow` result

Whether a survey actually appears is decided by the channel rules in the Pisano
panel. When it doesn't, `show` still resolves — with a value telling you why.
This is normal, not an error.

| Value | Category | Fires when | Recommended handling |
|-------|----------|------------|----------------------|
| `SendFeedback` | completed | user submitted the survey | thank the user; record "collected"; fire analytics |
| `Closed` / `Outside` | dismissed | user closed / tapped outside without submitting | no error; optionally retry later, don't loop |
| `DisplayOnce` / `PreventMultipleFeedback` | suppressed | already shown to / answered by this user | stop prompting for this channel |
| `QuotaExceeded` / `DisplayRateLimited` / `SurveyPassive` | suppressed | panel-side gating (quota / frequency cap / channel off) | nothing to do; safe to call `show` again later |
| `RedirectToStore` | completed | **Android only** — sent to the store review prompt | don't also trigger your own review request |
| `None` | inconclusive | not booted, trigger request failed, timed out (Android has a 60 s watchdog; iOS does not), `feedbackSDKClear()` called mid-survey, or a second concurrent `show()` was rejected | check `feedbackSDKBoot` returned `InitSuccess`; enable debug mode |
| `Opened` / `HealthCheckFailed` | — | never delivered here | ignore |

```ts
import { feedbackSDKCallback } from 'feedback-react-native-sdk';

function handleSurveyResult(result: feedbackSDKCallback | string) {
  switch (result) {
    case feedbackSDKCallback.SendFeedback:
      // feedback captured — thank the user, stop prompting this session
      break;
    case feedbackSDKCallback.DisplayOnce:
    case feedbackSDKCallback.PreventMultipleFeedback:
      // already has feedback from this user — stop prompting for this channel
      break;
    case feedbackSDKCallback.QuotaExceeded:
    case feedbackSDKCallback.DisplayRateLimited:
    case feedbackSDKCallback.SurveyPassive:
      // panel-side gating — not an error, try again later
      break;
    case feedbackSDKCallback.None:
      console.warn('feedbackSDKShow: no result — check boot / network');
      break;
    default:
      // Closed / Outside / RedirectToStore / Opened / HealthCheckFailed
      break;
  }
}
```

> **Don't gate UI on `await feedbackSDKShow(...)`.** Treat the result as a
> callback. A displayed survey stays open as long as the user wants, and on iOS,
> if the SDK was not booted or the trigger request fails, the native call never
> completes and the promise stays pending (Android has a 60 s watchdog; iOS does
> not). Gate on `feedbackSDKBoot` returning `InitSuccess`, and race your own
> timeout if you need a bounded wait.

### Preflight and events

```ts
import { feedbackSDKHealthCheck, feedbackSDKTrack } from 'feedback-react-native-sdk';

// Would a survey open right now? (nothing is shown)
if (await feedbackSDKHealthCheck({ customer: { externalId: 'USR-42' } })) {
  showFeedbackButton();
}

// Send a trigger event — a survey it triggers opens on its own
feedbackSDKTrack({ event: 'checkout_completed', payload: { orderId: 'ORD-987' } });
```

`feedbackSDKHealthCheck` resolves `boolean`. `feedbackSDKTrack` is
fire-and-forget (`void`) — the native SDKs don't report a triggered survey's
outcome back through it. Both require a successful `feedbackSDKBoot` first.

The sample screen (`src/App.tsx`) has a button for each call and logs the result.

### Clear the session

```ts
import { feedbackSDKClear } from 'feedback-react-native-sdk';

feedbackSDKClear(); // on logout / user switch
```

## Relationship to the SDK repo

This app is independent — it installs `feedback-react-native-sdk` from npm and
has no build-time link to the SDK source. The SDK repo also has an
[`example/`](https://github.com/Pisano/feedback-react-native-sdk/tree/main/example),
but that is a maintainer test console that runs against the library source; it is
not the same screen as this app.
