# Pisano Feedback (React Native) — SDK Integration Sample

This repository is a **React Native sample app** showing how to integrate and use **Pisano Feedback** via `feedback-react-native-sdk` in a real app (iOS + Android).

> The **native SDK source code is not in this repo**. This repo shows **how to integrate it**.

## 📋 Table of Contents

- [Requirements](#-requirements)
- [Install the SDK](#-install-the-sdk)
- [iOS setup](#-ios-setup)
- [Android setup](#-android-setup)
- [Quick Start (Boot / Show / Track / Clear)](#-quick-start-boot--show--track--clear)
- [Troubleshooting](#-troubleshooting)
- [Run this sample app](#-run-this-sample-app)

## 📱 Requirements

- **Node**: 18+
- **React Native**: 0.79.x (this sample is on 0.79)
- **iOS**: Xcode 15+, CocoaPods
- **Android**: JDK 17, Android SDK / Android Studio

## 📦 Install the SDK

In your app repo:

```sh
npm install feedback-react-native-sdk
```

## 🍎 iOS setup

From your app repo:

```sh
cd ios
pod install
```

### `use_frameworks!` + New Architecture

If your iOS project uses `use_frameworks!`, use **static linkage**:

```ruby
use_frameworks! :linkage => :static
```

If you run with **New Architecture enabled**, ensure your pods are generated with it (this sample sets it in `ios/Podfile`):

```ruby
ENV['RCT_NEW_ARCH_ENABLED'] = '1'
```

### Info.plist permissions

If your flows use attachments (camera / photo library), add:

- `NSCameraUsageDescription`
- `NSPhotoLibraryUsageDescription`
- `NSPhotoLibraryAddUsageDescription`

## 🤖 Android setup

### New Architecture toggle (SDK TurboModule)

If your app uses RN New Architecture and you want the SDK’s TurboModule implementation, add to:

- `android/gradle.properties`

```properties
FeedbackReactNativeSdk_newArchEnabled=true
```

### RN 0.79 Gradle plugin note (sample patch)

RN 0.79 moved autolinking/new-arch wiring into the React Native Gradle Plugin. If you hit Gradle errors inside the SDK like:

- `Plugin with id 'com.facebook.react' not found.`
- `compileSdkVersion is not specified.`

If you run into these, update to the latest `feedback-react-native-sdk` version (this sample uses **0.2.8**).

## 🚀 Quick Start (Boot / Show / Track / Clear)

### 1) Boot (initialize SDK)

Call once (e.g. at app start) before showing the widget:

```js
import { feedbackSDKBoot } from 'feedback-react-native-sdk';

feedbackSDKBoot(
  'YOUR_APP_ID',
  'YOUR_ACCESS_KEY',
  'https://api.pisano.co',
  'https://web.pisano.co/web_feedback',
  undefined, // eventUrl (optional)
  (status) => console.log('Boot status:', status)
);
```

**Boot method parameters**

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `appId` | `string` | ✅ | Application ID (from Pisano dashboard) |
| `accessKey` | `string` | ✅ | Access key (from Pisano dashboard) |
| `apiUrl` | `string` | ✅ | Base API URL |
| `feedbackUrl` | `string` | ✅ | Base URL for feedback/web widget |
| `eventUrl` | `string` | ❌ | Optional event/tracking URL |
| `callback` | `(status) => void` | ❌ | Receives SDK close/status string |

### 2) Show the widget

```js
import { feedbackSDKShow, feedbackSDKViewMode } from 'feedback-react-native-sdk';

feedbackSDKShow(
  feedbackSDKViewMode.BottomSheet, // or feedbackSDKViewMode.Default
  'We Value Your Feedback',        // title (string | null)
  16,                              // titleFontSize (number | null)
  null,                            // flowId (string | null)
  'en',                            // language (string | null)
  new Map([['externalId', 'USER-123']]),     // customer (Map | null)
  new Map([['source', 'react-native-app']]), // payload  (Map | null)
  (result) => console.log('Show result:', result)
);
```

#### Customer/payload keys (important)

- **Use `camelCase` keys** when sending `customer` and `payload`.
- **Do not use `snake_case`** (e.g. `phone_number`) unless your Pisano project explicitly expects that.

Examples:

```js
// ✅ Good (camelCase)
new Map([
  ['externalId', 'USER-123'],
  ['phoneNumber', '905551112233'],
  ['email', 'test@test.com'],
]);

// ❌ Avoid (snake_case)
new Map([
  ['external_id', 'USER-123'],
  ['phone_number', '905551112233'],
]);
```

**Show method parameters (`feedbackSDKShow`)**

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `viewMode` | `feedbackSDKViewMode` | ✅ | Widget presentation mode (`Default` / `BottomSheet`) |
| `title` | `string \| null` | ❌ | Custom widget title |
| `titleFontSize` | `number \| null` | ❌ | Title font size |
| `flowId` | `string \| null` | ❌ | Flow ID (send `null` for default flow) |
| `language` | `string \| null` | ❌ | Language code (`en`, `tr`, …) |
| `customer` | `Map<string, any> \| null` | ❌ | Customer properties |
| `payload` | `Map<string, string> \| null` | ❌ | Transactional/prefill data |
| `callback` | `(status) => void` | ✅ | Returns a `feedbackSDKCallback` value |

### 3) Track an event (optional)

```js
import { feedbackSDKTrack } from 'feedback-react-native-sdk';

feedbackSDKTrack(
  'purchase_completed',
  new Map([['amount', '49.99']]),
  new Map([['externalId', 'USER-123']]),
  'en',
  (status) => console.log('Track status:', status)
);
```

**Track method parameters**

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `event` | `string` | ✅ | Event name (e.g. `purchase_completed`) |
| `payload` | `Map<string, string> \| undefined` | ❌ | Event payload |
| `customer` | `Map<string, any> \| undefined` | ❌ | Customer properties |
| `language` | `string \| undefined` | ❌ | Language code |
| `callback` | `(status) => void` | ❌ | Completion callback (string) |

### 4) Clear (optional)

```js
import { feedbackSDKClear } from 'feedback-react-native-sdk';

feedbackSDKClear();
```

**Clear method parameters**

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| *(none)* |  |  | Clears SDK state (e.g. cached customer/session) |

### Enums

**`feedbackSDKViewMode`**

| Value | Description |
| --- | --- |
| `feedbackSDKViewMode.Default` | Default presentation |
| `feedbackSDKViewMode.BottomSheet` | Bottom sheet presentation |

**`feedbackSDKCallback`**

| Value | Description |
| --- | --- |
| `None` | No-op / unknown |
| `Closed` | Widget closed |
| `SendFeedback` | Feedback sent |
| `Outside` | Closed by tapping outside |
| `Opened` | Widget opened |
| `DisplayOnce` | Display-once rule triggered |
| `PreventMultipleFeedback` | Prevent-multiple-feedback rule triggered |
| `QuotaExceeded` | Quota exceeded |

### HealthCheck?

The React Native wrapper (`feedback-react-native-sdk`) **does not export a `healthCheck` API** at the moment (unlike the native iOS sample app).

## 📸 Screenshots

Add the following screenshots under `docs/screenshots/` and they will render here:

### Main (Getting Started)

![Main screen](docs/screenshots/main.png)

### Detail (Form)

![Detail screen](docs/screenshots/detail.png)

### Widget (SDK UI)

![Widget screen](docs/screenshots/widget.png)

## 🔧 Troubleshooting

### Android: “Unable to load script… make sure you are either running Metro…”

- Start Metro: `npx react-native start`
- Physical device over USB: `adb reverse tcp:8081 tcp:8081`

### iOS: “Bundle React Native code and images” fails

- Restart Metro
- Re-run pods:

```sh
cd ios
pod install
```

## ▶️ Run this sample app

```sh
npm install
npm run start
```

Then:

- iOS: `npm run ios`
- Android: `npm run android`

