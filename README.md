# Pisano Feedback Sample Application

It is a sample react native application using the Feedback SDK.

## How to use Feedback SDK

You can check the latest releases [here](https://www.npmjs.com/package/feedback-react-native-sdk).

Pisano Feedback SDK for React Native
## Installation

```sh
npm install feedback-react-native-sdk
```

For iOS
```sh
cd iOS && pod install
```

## Usage

```js
import { feedbackSDKDebugMode } from 'feedback-react-native-sdk';
import { feedbackSDKBoot } from 'feedback-react-native-sdk';
import { feedbackSDKShow } from 'feedback-react-native-sdk';
import { feedbackSDKTrack } from 'feedback-react-native-sdk';
import { feedbackSDKClear } from 'feedback-react-native-sdk';

// ...

feedbackSDKDebugMode(bool);

feedbackSDKBoot(appId, accessKey, apiUrl, feedbackUrl, eventUrl);
      
feedbackSDKShow(flowId, language, customer, payload, (status) => {
      console.log("Show Status: " + status);
    });

feedbackSDKTrack(event, payload, customer, language, (status) => {
      console.log("Show Status: " + status);
    });

feedbackSDKClear();

```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

