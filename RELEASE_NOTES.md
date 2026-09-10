# Release Notes — feedback-sample-react-native-app

## v0.3.0 (breaking)

### Overview

Aligned with **feedback-react-native-sdk ^0.3.0**, a breaking release. The
sample app's native projects were regenerated on the current React Native
template.

### Breaking changes (from the SDK)

- **New Architecture only.** The legacy-bridge code paths are gone. React
  Native ≤ 0.81 is unsupported — stay on `feedback-react-native-sdk@0.2.x`.
- **`peerDependencies`**: `react-native >= 0.82.0`, `react >= 19.1.0` (0.82 is
  the New Architecture-only floor).
- **`feedbackSDKBoot` / `feedbackSDKShow` take an options object and return a
  promise.** `await feedbackSDKBoot({ appId, accessKey, code, apiUrl, feedbackUrl })`,
  `await feedbackSDKShow({ viewMode, customer, payload })`. The positional
  signatures still work (now `@deprecated`).
- **`feedbackSDKCallback` is a string enum.** `status === feedbackSDKCallback.Closed`
  works; code relying on the old numeric value does not. Boot now returns
  `"InitSuccess"` / `"InitFailed"`; new value `"RedirectToStore"` (Android only).
  `"Opened"` is no longer delivered.

### New SDK functions (both native SDKs already had them)

- **`feedbackSDKHealthCheck(options?)` → `Promise<boolean>`** — would `show()`
  open a survey right now, without showing anything.
- **`feedbackSDKTrack(options)` → `void`** — send a custom event to the trigger
  engine (was removed in the SDK's 0.2.11, now restored). Fire-and-forget.

### Sample app changes

- React Native **0.79 → 0.87**: native projects regenerated (Swift
  `AppDelegate`, Gradle 9.4, Android SDK 37 / Kotlin 2.2), Java → Kotlin.
- **Node 22.13+** required.
- Legacy scaffolding removed (`_BUCK`, `jni/` C++, `.buckconfig`, `.flowconfig`).
- Dev dependencies modernized (`@react-native/*` 0.87, ESLint 8, Jest dropped).
- `App.js` → `src/App.tsx`; credentials read from git-ignored
  `src/pisano.config.ts` (created from the example on `yarn install`).
- Actions screen: added **Health check** and **Track event** buttons.

### Migration

1. `"feedback-react-native-sdk": "^0.3.0"`, React Native ≥ 0.82, Node per your RN version.
2. Switch `feedbackSDKBoot` / `feedbackSDKShow` calls to the options form.
3. Replace numeric callback comparisons with `feedbackSDKCallback.*`.
4. `yarn install`, `cd ios && pod install`, clean builds.
5. Android: no manifest change needed unless your app deliberately sets
   `android:allowBackup="true"` (then add your own `tools:replace`).

---

## v0.2.16

### Overview

Sample app aligned with **feedback-react-native-sdk ^0.2.16**. Native pin bump only — no React Native API changes.

### Native SDK pins (RN 0.2.16)

| Platform | Native SDK |
|----------|------------|
| Android | `co.pisano:feedback` **1.3.33** |
| iOS | `Pisano` pod **1.0.21** |

### What's included (via native SDKs)

- **WebView zoom control** — configurable per channel from Pisano panel (`disable_zoom`)
- **Keyboard and scrolling** — improved bottom sheet behaviour on Android and iOS
- **Bottom sheet display** — scrim/overlay fixes on Android; drag-to-dismiss from previous release preserved

### Migration

1. Update dependency: `"feedback-react-native-sdk": "^0.2.16"`
2. Run `npm install` (or `yarn`)
3. iOS: `cd ios && pod install`
4. Clean build if needed

No breaking changes. Existing `feedbackSDKBoot` / `feedbackSDKShow` calls work unchanged.

---

## v0.2.15 (bottom sheet)

### Features

- **`dismissOnDrag` on `feedbackSDKShow`** — Optional last argument (default `false`). Set to `true` to allow swipe-down dismiss on bottom sheet (Android and iOS).
- Sample app: **Dismiss on drag (Off/On)** segment on the form screen.

### Native SDK pins (RN 0.2.15)

| Platform | Native SDK |
|----------|------------|
| Android | `co.pisano:feedback` **1.3.31** |
| iOS | `Pisano` pod **1.0.18** |

### Migration

1. Update dependency: `"feedback-react-native-sdk": "^0.2.15"`
2. Run `npm install` (or `yarn`)
3. iOS: `cd ios && pod install`
4. Optional — enable drag dismiss:

```js
feedbackSDKShow(
  feedbackSDKViewMode.BottomSheet,
  title,
  titleFontSize,
  code,
  language,
  customer,
  payload,
  (result) => console.log(result),
  true, // dismissOnDrag
);
```

No breaking changes. Existing calls work unchanged.

---

## v0.2.13 (2025-04-03)

### Bug Fixes

- **Fixed white background behind BottomSheet on Android** — The area behind the BottomSheet dialog no longer shows a white background.
- **Fixed keyboard not opening in BottomSheet WebView on Android** — Text input fields inside the survey now correctly trigger the soft keyboard.

### Internal

- Android native SDK updated to 1.3.30.

### Migration

1. Update SDK dependency: `"feedback-react-native-sdk": "^0.2.13"`
2. Run `npm install` or `yarn install`
3. On iOS: `cd ios && pod install`
4. Clean build: Android `cd android && ./gradlew clean`, iOS clean build folder in Xcode

No API changes. No code changes required.

---

## v0.2.11 (2025-03-18)

### Breaking Changes

#### `feedbackSDKTrack` removed

`feedbackSDKTrack` has been removed from the SDK. Remove any calls to `feedbackSDKTrack(...)` from your codebase before upgrading.

### Bug Fixes

- **Fixed TurboModule detection on React Native 0.79+** — The SDK now correctly detects New Architecture by checking `global.RN$Bridgeless`, fixing crashes on RN 0.79+ with `newArchEnabled=true`.
- Both New Architecture and Legacy Bridge modes now work correctly on Android and iOS.

### Migration Checklist

1. Update SDK dependency: `"feedback-react-native-sdk": "^0.2.11"`
2. Remove any `feedbackSDKTrack(...)` calls from your code
3. Run `npm install` or `yarn install`
4. On iOS: `cd ios && pod install`
5. Clean build: Android `cd android && ./gradlew clean`, iOS clean build folder in Xcode

---

## v0.2.9 (2025-01-29)

### Breaking Changes

#### `code` parameter is now required in `feedbackSDKBoot`

SDK 0.2.9 introduces the `code` parameter (channel/config identifier, e.g. `PSN-xxxxx`) as a **required** argument in `feedbackSDKBoot`. Previously the boot call did not require this parameter.

**Before (0.2.8):**

```js
feedbackSDKBoot(appId, accessKey, apiUrl, feedbackUrl, eventUrl, callback);
```

**After (0.2.9):**

```js
feedbackSDKBoot(appId, accessKey, code, apiUrl, feedbackUrl, eventUrl, callback);
//                                 ^^^^
//                          new required parameter
```

Full example:

```js
feedbackSDKBoot(
  'YOUR_APP_ID',
  'YOUR_ACCESS_KEY',
  'PSN-xxxxx',                          // code (new)
  'https://api.pisano.co',
  'https://web.pisano.co/web_feedback',
  undefined,                             // eventUrl (optional)
  (status) => console.log('Boot:', status),
);
```

#### `code` parameter added to `feedbackSDKShow`

`feedbackSDKShow` now accepts an optional `code` override. Pass `null` to use the boot code or pass a different code per-show call.

**Before (0.2.8):**

```js
feedbackSDKShow(viewMode, title, titleFontSize, language, customer, payload, callback);
```

**After (0.2.9):**

```js
feedbackSDKShow(viewMode, title, titleFontSize, code, language, customer, payload, callback);
//                                               ^^^^
//                                    new parameter (string | null)
```

Full example:

```js
feedbackSDKShow(
  feedbackSDKViewMode.Default,
  'We Value Your Feedback',
  16,
  null,           // code — null = use boot code, or pass a different code
  'en',
  new Map([
    ['name', 'John'],
    ['email', 'john@example.com'],
    ['phoneNumber', '905551112233'],
    ['externalId', 'USER-123'],
  ]),
  new Map([['source', 'react-native-app']]),
  (result) => console.log('Show:', result),
);
```

---

### New Callback Values

Two new `feedbackSDKCallback` values are now returned by the SDK:

| Callback Value         | Description                                      |
| ---------------------- | ------------------------------------------------ |
| `DisplayRateLimited`   | Widget display was throttled by server-side rules |
| `SurveyPassive`        | Channel is in passive mode, widget not shown      |

Handle them in your callback:

```js
feedbackSDKShow(
  feedbackSDKViewMode.Default,
  'Title', 16, null, 'en', customer, payload,
  (result) => {
    switch (result) {
      case 'DisplayRateLimited':
        console.log('Rate limited — try again later');
        break;
      case 'SurveyPassive':
        console.log('Channel is passive — no widget displayed');
        break;
      default:
        console.log('Result:', result);
    }
  },
);
```

---

### Bug Fixes

- **New Architecture flag mismatch fixed**: `FeedbackReactNativeSdk_newArchEnabled` was `true` while the app's `newArchEnabled` was `false`, causing a String-to-Double cast crash on Android. Both flags are now aligned to `false`.

---

### Housekeeping

- Hardcoded credentials removed from `DEFAULTS` — replaced with `YOUR_APP_ID`, `YOUR_ACCESS_KEY`, `YOUR_CODE` placeholders
- `pisano.config.js` (containing real credentials) removed from git history and properly git-ignored
- `App.js` cleaned up: removed unused `ColorSwatches` component, consistent formatting, section comments added
- `README.md` simplified: removed non-existent screenshot references, trimmed verbose sections
- `.gitignore` streamlined: removed unused BUCK/Fastlane patterns
- `pisano.config.example.js` cleaned up: removed redundant comments

---

### Migration Checklist

1. Update SDK dependency: `"feedback-react-native-sdk": "^0.2.9"`
2. Add `code` parameter to your `feedbackSDKBoot` call (3rd argument)
3. Add `code` parameter to your `feedbackSDKShow` call (4th argument, pass `null` to reuse boot code)
4. Handle new callback values (`DisplayRateLimited`, `SurveyPassive`) if needed
5. On Android: ensure `FeedbackReactNativeSdk_newArchEnabled` matches `newArchEnabled` in `gradle.properties`
6. Run `cd ios && pod install` to pick up new native SDK version (Pisano 1.0.17)
