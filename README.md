# Pisano Feedback SDK - React Native Sample App

A sample React Native application demonstrating how to integrate **[feedback-react-native-sdk](https://www.npmjs.com/package/feedback-react-native-sdk)** on iOS and Android.

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

### Boot

Call once at app start to initialize the SDK:

```js
import { feedbackSDKBoot } from 'feedback-react-native-sdk';

feedbackSDKBoot(
  appId,       // Application ID
  accessKey,   // Access key
  code,        // Channel code (e.g. "PSN-xxxxx")
  apiUrl,      // API base URL
  feedbackUrl, // Feedback widget URL
  eventUrl,    // Event URL (optional)
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
  feedbackSDKViewMode.Default, // or .BottomSheet
  'Title',                     // title (string | null)
  16,                          // titleFontSize (number | null)
  null,                        // code override (string | null)
  'en',                        // language (string | null)
  new Map([['email', 'user@example.com']]), // customer
  new Map([['source', 'app']]),             // payload
  (result) => console.log('Show:', result)
);
```

| Parameter       | Type                    | Required | Description                          |
| --------------- | ----------------------- | -------- | ------------------------------------ |
| `viewMode`      | `feedbackSDKViewMode`   | Yes      | `Default` or `BottomSheet`           |
| `title`         | `string \| null`        | No       | Custom widget title                  |
| `titleFontSize` | `number \| null`        | No       | Title font size                      |
| `code`          | `string \| null`        | No       | Override the boot code for this call |
| `language`      | `string \| null`        | No       | Language code (`en`, `tr`, ...)      |
| `customer`      | `Map<string, any>`      | No       | Customer properties (camelCase keys) |
| `payload`       | `Map<string, string>`   | No       | Payload data                         |
| `callback`      | `fn`                    | Yes      | Returns `feedbackSDKCallback` value  |

### Track

```js
import { feedbackSDKTrack } from 'feedback-react-native-sdk';

feedbackSDKTrack('purchase_completed', payload, customer, 'en', (s) => console.log(s));
```

### Clear

```js
import { feedbackSDKClear } from 'feedback-react-native-sdk';

feedbackSDKClear();
```

## Enums

**`feedbackSDKViewMode`**: `Default` | `BottomSheet`

**`feedbackSDKCallback`**:

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

## Troubleshooting

**Android: "Unable to load script"**
- Run `adb reverse tcp:8081 tcp:8081`
- Make sure Metro is running: `npx react-native start`

**iOS: Build fails after SDK update**
- `cd ios && pod install`
- Clean build folder in Xcode (Cmd+Shift+K)
