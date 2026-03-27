# Release Notes — feedback-sample-react-native-app

## v0.2.12 (2025-03-18)

### Bug Fixes

- **Fixed BottomSheet scroll conflict on Android** — Users can now scroll back up to previous survey questions in BottomSheet mode.
- **Fixed white screen in BottomSheet mode on Android** — Resolved a lifecycle issue where the BottomSheet could render a blank screen on certain devices.

### Internal

- Android native SDK updated from 1.3.28 to 1.3.29.

### Migration

1. Update SDK dependency: `"feedback-react-native-sdk": "^0.2.12"`
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
