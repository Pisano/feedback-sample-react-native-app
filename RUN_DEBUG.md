# Run & Debug Guide

Step-by-step guide to build and run the sample app on a physical device or emulator.

## Prerequisites

| Tool | Minimum | Check |
|------|---------|-------|
| Node | **22.13+** | `node -v` |
| JDK | 17 | `java -version` |
| Android SDK | API 37, build-tools 37 | Android Studio > SDK Manager |
| Xcode | 16+ | `xcodebuild -version` |
| CocoaPods | 1.16+ | `pod --version` |

This app is on React Native 0.87 (`feedback-react-native-sdk` supports ≥ 0.82),
**New Architecture only**.

## One-time Environment Setup

### ANDROID_HOME & adb (macOS / zsh)

Many "command not found" and ENOENT errors come from `adb` not being in PATH.
Add these lines to `~/.zshrc` (only once):

```bash
# Android SDK
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator
```

Then reload:

```bash
source ~/.zshrc
```

Verify:

```bash
adb --version       # should print version
emulator -list-avds # should list emulators (if any)
```

## Install Dependencies

```bash
yarn install

# iOS only
cd ios && pod install && cd ..
```

## Android

### 1. Start Metro

```bash
npx react-native start --reset-cache
```

Keep this terminal open.

### 2. Connect device

**Physical device (USB):**

```bash
adb devices          # should show your device
adb reverse tcp:8081 tcp:8081   # forward Metro port to device
```

**Emulator:**

```bash
emulator -avd <AVD_NAME>   # or launch from Android Studio
# adb reverse is not needed for emulator
```

### 3. Build & Run

Open a **new terminal**:

```bash
npx react-native run-android
```

### Common Android Errors

| Error | Fix |
|-------|-----|
| `spawnSync adb ENOENT` | `ANDROID_HOME` not set. See "One-time Setup" above. |
| `Unable to load script` | Run `adb reverse tcp:8081 tcp:8081` and make sure Metro is running. |
| `Could not determine SDK directory` | Set `ANDROID_HOME` or create `android/local.properties` with `sdk.dir=/Users/<you>/Library/Android/sdk` |
| `Manifest merger failed ... allowBackup` | Only if your app deliberately sets `android:allowBackup="true"` — the SDK's bridge manifest neutralises the Pisano AAR's value, so a normal app needs nothing. |
| `Minimum supported Gradle version is 9.x` | Update `android/gradle/wrapper/gradle-wrapper.properties` to the version React Native 0.87 ships (9.4.1). |
| Build succeeds but app doesn't open | Run manually: `adb shell am start -n com.feedbacksamplereactnativeapp/.MainActivity` |
| `No connected devices` | Enable USB Debugging on phone: Settings > Developer Options > USB Debugging. |

### Quick Android one-liner (copy-paste)

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk && \
export PATH=$PATH:$ANDROID_HOME/platform-tools && \
adb reverse tcp:8081 tcp:8081 && \
npx react-native run-android
```

## iOS

### 1. Start Metro

```bash
npx react-native start --reset-cache
```

### 2. Build & Run

**Via CLI:**

```bash
npx react-native run-ios
```

**Via Xcode:**

1. Open `ios/FeedbackSampleReactNativeApp.xcworkspace` (not `.xcodeproj`)
2. Select your device/simulator
3. Cmd+R to build and run

### Common iOS Errors

| Error | Fix |
|-------|-----|
| Pod install fails (UTF-8) | `LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 pod install` |
| `No such module 'feedback_react_native_sdk'` | Run `cd ios && pod install` |
| Build fails after SDK update | Clean: Xcode > Product > Clean Build Folder (Cmd+Shift+K), then rebuild. |
| Signing errors | Open Xcode, go to Signing & Capabilities, select your team. |

### New Architecture

`feedback-react-native-sdk@0.3.x` is **New Architecture only** — there is no
Old Architecture mode to toggle. React Native 0.82+ (the SDK's floor) has no
Old Architecture at all, so on any supported version it is the only option.

## Debugging Tips

### React Native Debugger

- Shake device (or Cmd+D in simulator) to open Dev Menu
- Enable "Debug with Chrome" for JS debugging

### Check Metro connection

```bash
# From device browser or curl:
curl http://localhost:8081/status
# Should return "packager-status:running"
```

### Reload app

- Android: `adb shell input keyevent 82` (opens dev menu) or double-tap R in emulator
- iOS: Cmd+R in simulator

### View native logs

```bash
# Android
adb logcat | grep -i "ReactNative\|Pisano\|feedback"

# iOS
# Use Xcode console or:
xcrun simctl spawn booted log stream --predicate 'process == "FeedbackSampleReactNativeApp"'
```
