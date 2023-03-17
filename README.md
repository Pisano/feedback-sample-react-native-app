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

In order to use iOS SDK, you should add the following permissions in Info.plist file

| Permission Key Value | | |
| ------- | --- | --- |
| Camera | Privacy - Camera Usage Description | $(PRODUCT_NAME) camera use |
| Gallery Access | Privacy - Photo Library Usage Description | $(PRODUCT_NAME) photo use |
| Saving Photo to Gallery | Privacy - Photo Library Additions Usage Description | $(PRODUCT_NAME) photo save |

## Usage

```js
import {
  feedbackSDKDebugMode,
  feedbackSDKBoot,
  feedbackSDKShow,
  feedbackSDKClear,
  feedbackSDKViewMode,
  feedbackSDKCallback
} from 'feedback-react-native-sdk'

// ...

feedbackSDKDebugMode(bool);

feedbackSDKBoot(appId, accessKey, apiUrl, feedbackUrl, eventUrl);
      
feedbackSDKShow(feedbackSDKViewMode, customTitle, titleFontSize, flowId, language, customer, payload, (status) => {
      console.log("Show Status: " + status);
    });

feedbackSDKTrack(event, payload, customer, language, (status) => {
      console.log("Show Status: " + status);
    });

feedbackSDKClear();

```
Boot Method
| Parameter Name | Type  | Description  |
| ------- | --- | --- |
| appId  | String | The application ID that can be obtained from Pisano Dashboard  |
| accessKey  | String | The access key can be obtained from Pisano Dashboard |
| apiUrl  | String | The URL of API that will be accessed |
| feedbackUrl  | String | Base URL for survey |
| eventUrl  | String | Event URL for tracking |

Show Method
| Parameter  Name | Type  | Description  |
| ------- | --- | --- |
| viewMode | feedbackSDKViewMode | View Mode of Flow Screen, Default or Bottom Sheet |
| title | String | Custom Title of Flow Screen |
| titleFontSize | number | Custom Title Font Size |
| flowId | String | The ID of related flow. Can be obtained from Pisano Dashboard. Can be sent as empty string "" for default flow |
| language | String | Language code |
| payload | Dictionary  | Question and related answer in an array (mostly uses for pre-loaded responses to take transactional data(s))  |
| customer | Dictionary | Customer Properties |
| completion | feedbackSDKCallback | feedbackSDKCallback enum |

```js
feedbackSDKCallback
  None
  Closed,
  SendFeedback,
  Outside,
  Opened,
  DisplayOnce,
  PreventMultipleFeedback,
  QuotaExceeded
  ```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

