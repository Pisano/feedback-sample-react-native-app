# Pisano Feedback SDK - React Native Sample App

A sample React Native application demonstrating how to integrate **[feedback-react-native-sdk](https://www.npmjs.com/package/feedback-react-native-sdk)** on iOS and Android.

**SDK version in this sample:** `feedback-react-native-sdk` **^0.2.16** (Android native **1.3.33**, iOS Pisano **1.0.21**)

## Requirements

- Node 18+
- React Native 0.79+
- iOS: Xcode 15+, CocoaPods
- Android: JDK 17, Android SDK

## Setup

```sh
npm install
```

Create your local config:

```sh
cp pisano.config.example.js pisano.config.js
```

Fill in `appId`, `accessKey`, `code`, and URLs from the [Pisano dashboard](https://dashboard.pisano.co).

### iOS

```sh
cd ios && pod install && cd ..
npx react-native run-ios
```

### Android

```sh
npx react-native run-android
```

> Physical device over USB: run `adb reverse tcp:8081 tcp:8081` before starting.

## SDK Usage

### Debug mode

Enables verbose native logging. Call **before** boot.

```js
import { feedbackSDKDebugMode } from 'feedback-react-native-sdk';

feedbackSDKDebugMode(true);

// Android: adb logcat -s PISANO_SDK ReactNativeJS
// iOS: Xcode console → filter "Pisano"
```

### Boot

Call once at app start to initialize the SDK:

```js
import { feedbackSDKBoot } from 'feedback-react-native-sdk';

feedbackSDKBoot(
  'YOUR_APP_ID',
  'YOUR_ACCESS_KEY',
  'PSN-xxxxx',                              // code (required)
  'https://api.pisano.co',
  'https://web.pisano.co/web_feedback',
  undefined,                                 // eventUrl (optional)
  (status) => console.log('Boot:', status)
);
```

| Parameter     | Type     | Required | Description                  |
| ------------- | -------- | -------- | ---------------------------- |
| `appId`       | `string` | Yes      | Application ID               |
| `accessKey`   | `string` | Yes      | Access key                   |
| `code`        | `string` | Yes      | Channel code (e.g. PSN-xxxxx)|
| `apiUrl`      | `string` | Yes      | API base URL                 |
| `feedbackUrl` | `string` | Yes      | Feedback widget URL          |
| `eventUrl`    | `string` | No       | Event/tracking URL           |
| `callback`    | `fn`     | No       | Status callback              |

### Show

Display the feedback widget:

```js
import { feedbackSDKShow, feedbackSDKViewMode } from 'feedback-react-native-sdk';

feedbackSDKShow(
  feedbackSDKViewMode.BottomSheet,
  'We Value Your Feedback',                  // title
  16,                                        // titleFontSize
  null,                                      // code override (null = use boot code)
  'en',                                      // language
  new Map([                                  // customer
    ['name', 'John Doe'],
    ['email', 'user@example.com'],
    ['phoneNumber', '+905551112233'],
    ['externalId', 'USR-42'],
  ]),
  new Map([                                  // payload
    ['screenName', 'Checkout'],
    ['orderId', 'ORD-987'],
  ]),
  (result) => console.log('Show:', result),
  false, // dismissOnDrag (optional, default false)
);
```

| Parameter       | Type                    | Required | Description                          |
| --------------- | ----------------------- | -------- | ------------------------------------ |
| `viewMode`      | `feedbackSDKViewMode`   | Yes      | `Default` or `BottomSheet`           |
| `title`         | `string \| null`        | No       | Custom widget title                  |
| `titleFontSize` | `number \| null`        | No       | Title font size                      |
| `code`          | `string \| null`        | No       | Override the boot code for this call |
| `language`      | `string \| null`        | No       | Language code (`en`, `tr`, ...)      |
| `customer`      | `Map<string, any>`      | No       | Customer info (camelCase keys)       |
| `payload`       | `Map<string, string>`   | No       | Custom data (camelCase keys)         |
| `callback`      | `fn`                    | Yes      | Returns `feedbackSDKCallback` value  |
| `dismissOnDrag` | `boolean`               | No       | Default `false`. When `true` with `BottomSheet`, swipe-down dismiss |

The sample form includes **Dismiss on drag (Off/On)** — see `App.js`. See [RELEASE_NOTES.md](./RELEASE_NOTES.md#v0215-mt-41--bottom-sheet) for MT-41 details.

**Customer keys:** `name`, `email`, `phoneNumber`, `externalId`, `customAttributes` (both camelCase and snake_case are accepted, but camelCase is recommended)

**Payload keys:** any key-value pairs relevant to your context (e.g. `screenName`, `orderId`, `productCategory`)

### Clear

```js
import { feedbackSDKClear } from 'feedback-react-native-sdk';

feedbackSDKClear();
```

## Callback values

| Value                      | Description                    |
| -------------------------- | ------------------------------ |
| `Closed`                   | Widget closed                  |
| `SendFeedback`             | Feedback submitted             |
| `Outside`                  | Tapped outside widget          |
| `Opened`                   | Widget opened                  |
| `DisplayOnce`              | Display-once rule triggered    |
| `PreventMultipleFeedback`  | Multiple feedback prevented    |
| `QuotaExceeded`            | Channel quota exceeded         |
| `DisplayRateLimited`       | Display rate limited           |
| `SurveyPassive`            | Channel is passive             |
| `HealthCheckFailed`        | SDK initialization failed      |

## New Architecture support

The SDK works with both architectures out of the box:

- `newArchEnabled=true` → TurboModule
- `newArchEnabled=false` → Legacy bridge

No extra configuration needed. The SDK reads the standard `newArchEnabled` flag from `gradle.properties`.

## Troubleshooting

**Android: "Unable to load script"**
- Run `adb reverse tcp:8081 tcp:8081`
- Make sure Metro is running: `npx react-native start`

**iOS: Build fails after SDK update**
- `cd ios && pod install`
- Clean build folder in Xcode (Cmd+Shift+K)
