# Pisano Feedback SDK — React Native Sample App

[![CI](https://github.com/Pisano/feedback-sample-react-native-app/actions/workflows/ci.yml/badge.svg)](https://github.com/Pisano/feedback-sample-react-native-app/actions/workflows/ci.yml)

A standalone React Native app showing how to integrate
**[feedback-react-native-sdk](https://www.npmjs.com/package/feedback-react-native-sdk)**
on iOS and Android. It installs the SDK from npm like a real integration — it is
not linked to the SDK source.

**SDK version:** `feedback-react-native-sdk` **^0.4.0** (native Pisano 2.0)
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

`feedback-react-native-sdk@0.3.x` and later are **New Architecture only**. React Native
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
import { feedbackSDKBoot } from 'feedback-react-native-sdk';

const booted = await feedbackSDKBoot({
  appId: 'YOUR_APP_ID',
  accessKey: 'YOUR_ACCESS_KEY',
  code: 'PSN-xxxxx',
  apiUrl: 'https://api.pisano.co',
  feedbackUrl: 'https://web.pisano.co/web_feedback',
  // eventUrl: 'https://events.pisano.co',   // optional
});

if (!booted) {
  // Boot failed (bad credentials / wrong URL / TLS / no connection):
  // feedbackSDKShow() resolves None. Turn on debug mode, retry on next launch.
}
```

`feedbackSDKBoot` resolves a `boolean`: `true` when the SDK booted.

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
| `Closed` | dismissed | user closed without submitting (close button, back, drag, a tap outside, or the app took it away); the `closed` event's `closeReason` says how | no error; optionally retry later, don't loop |
| `DisplayOnce` / `PreventMultipleFeedback` | suppressed | already shown to / answered by this user | stop prompting for this channel |
| `ChannelQuotaExceeded` / `DisplayRateLimited` / `ChannelPassive` | suppressed | panel-side gating (quota / frequency cap / channel off) | nothing to do; safe to call `show` again later |
| `None` | inconclusive | not booted, no connection, the request failed, the page could not load, `feedbackSDKClear()` called mid-survey, or another survey was already open | check `feedbackSDKBoot` resolved `true`; enable debug mode |

A store review request is not a result: it is the `redirectedToStore` event of `feedbackSDKOn`.

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
    case feedbackSDKCallback.ChannelQuotaExceeded:
    case feedbackSDKCallback.DisplayRateLimited:
    case feedbackSDKCallback.ChannelPassive:
      // panel-side gating — not an error, try again later
      break;
    case feedbackSDKCallback.None:
      console.warn('feedbackSDKShow: no result — check boot / network');
      break;
    default:
      // Closed
      break;
  }
}
```

> **Don't gate UI on `await feedbackSDKShow(...)`.** Treat the result as a
> callback: a displayed survey stays open as long as the user wants. A survey
> that is not shown resolves right away (`None` or a gating value).

### Preflight and events

```ts
import { feedbackSDKHealthCheck, feedbackSDKTrack } from 'feedback-react-native-sdk';

// Would a survey open right now? (nothing is shown)
if (await feedbackSDKHealthCheck({ customer: { externalId: 'USR-42' } })) {
  showFeedbackButton();
}

// Send a trigger event — a survey it triggers opens on its own
const sent = await feedbackSDKTrack({ event: 'checkout_completed', payload: { orderId: 'ORD-987' } });
```

`feedbackSDKHealthCheck` resolves `boolean`. `feedbackSDKTrack` resolves
`true` when the server accepted the event (`false`: not booted, no `eventUrl`,
no connection, or the request failed). A survey it triggers reports through
`feedbackSDKOn` like any other.

Survey events (`opened`, `feedbackSubmitted`, `redirectedToStore`, `closed`)
come through `feedbackSDKOn(listener)`, which returns an unsubscribe function.
`feedbackSDKSetRequestTimeout(seconds)` sets the network timeout of every SDK
request (default 30 s).

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
