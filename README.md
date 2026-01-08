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

This sample app applies a `patch-package` patch that fixes `feedback-react-native-sdk/android/build.gradle` for RN 0.79+.

If you need the same fix in your own app repo:

1) Add `patch-package`
2) Copy the patch from this repo’s `patches/feedback-react-native-sdk+0.2.7.patch`
3) Add `postinstall` → `patch-package`

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

### 4) Clear (optional)

```js
import { feedbackSDKClear } from 'feedback-react-native-sdk';

feedbackSDKClear();
```

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

