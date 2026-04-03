# feedback-react-native-sdk — Müşteri Entegrasyon Sorunları

Müşterilerin karşılaştığı hatalar ve kök neden analizi.

---

## Hata 1: `generateCodegenArtifactsFromSchema` task not found (Android)

```
Cannot locate tasks that match ':feedback-react-native-sdk:generateCodegenArtifactsFromSchema'
as task 'generateCodegenArtifactsFromSchema' not found in project ':feedback-react-native-sdk'
```

### Kök neden

SDK'nın `android/build.gradle` dosyasında React plugin sadece `newArchEnabled=true` iken uygulanıyor:

```groovy
if (isNewArchitectureEnabled()) {
  apply plugin: 'com.facebook.react'
  react { ... }
}
```

`generateCodegenArtifactsFromSchema` bu plugin tarafından tanımlanıyor. Müşteri app'inde `newArchEnabled=true` olduğunda:

1. Autolinking / RN build sistemi `:feedback-react-native-sdk:generateCodegenArtifactsFromSchema` task'ına bağımlılık ekliyor.
2. Ancak SDK projesi `rootProject.newArchEnabled`'ı farklı okuyabilir veya yapılandırma sırası nedeniyle bu task hiç oluşturulmuyor.
3. Gradle, var olmayan bir task'ı çalıştırmaya çalışınca hata alıyor.

### Olası çözümler

**Seçenek A — Müşteri tarafında:** New Architecture kapatılsın:

```properties
# android/gradle.properties
newArchEnabled=false
```

Sonrasında temiz build: `cd android && ./gradlew clean && cd ..` ardından `npx react-native run-android`.

**Seçenek B — SDK tarafında:** React plugin her zaman uygulanabilir, task'ların `onlyIf` ile kontrol edilmesi sağlanabilir (örn. `needsCodegenFromPackageJson`). Böylece task her zaman tanımlı olur, gerekmezse skip edilir.

**Seçenek C:** `rootProject.hasProperty("newArchEnabled")` ve `rootProject.getProperty("newArchEnabled") == "true"` kontrolünün müşteri projesindeki farklı gradle yapılandırmalarıyla uyumlu olduğundan emin olunmalı (örn. environment variable, -P parametresi vb.).

---

## Hata 2: "The package 'feedback-react-native-sdk' doesn't seem to be linked"

```
Error booting FeedbackSDK: Error: The package 'feedback-react-native-sdk' doesn't seem to be linked.
Make sure:
- You have run 'pod install' (iOS)
- You have rebuilt the Android app
- You rebuilt the app after installing the package
```

### Kök neden

Native modül ya hiç link edilmemiş ya da build başarısız olduğu için native kod dahil edilmemiş.

### Android

1. `generateCodegenArtifactsFromSchema` hatası nedeniyle build başarısız olmuş olabilir.
2. Paket eklendikten sonra tam rebuild yapılmamış olabilir.

Yapılacaklar:
```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

### iOS

1. `pod install` çalıştırılmamış olabilir.
2. `.xcworkspace` yerine `.xcodeproj` ile açılmış olabilir.

Yapılacaklar:
```bash
cd ios
pod install
cd ..
npx react-native run-ios
```

(Xcode kullanıyorsa `FeedbackSampleReactNativeApp.xcworkspace` ile açılmalı.)

---

## Özet: Hata zinciri

```
Müşteri newArchEnabled=true ile build alıyor
    → RN build, SDK için codegen task'ına bağımlılık ekliyor
    → SDK bu task'ı oluşturmuyor (plugin koşullu uygulanıyor)
    → Gradle: "task not found"
    → Build başarısız
    → (Alternatif: müşteri newArch=false deneyip build alırsa)
    → "doesn't seem to be linked" → muhtemelen tam rebuild yapılmamış
```

---

## Çözüm: SDK v0.2.13

Bu sorunlar **v0.2.11** ile çözülmüştür:

- React Native 0.79+ için TurboModule algılama mekanizması düzeltildi
- New Architecture (newArchEnabled=true) ve Legacy Bridge (newArchEnabled=false) modlarında tam uyumluluk sağlandı
- Android ve iOS platformlarında doğrulandı

Ek olarak **v0.2.12** ve **v0.2.13** ile:

- Android BottomSheet modunda scroll çakışması giderildi
- Android BottomSheet modunda beyaz ekran sorunu düzeltildi
- Android BottomSheet arkasındaki beyaz arka plan düzeltildi
- Android BottomSheet içinde keyboard açılmama sorunu düzeltildi

Güncelleme:

```bash
npm install feedback-react-native-sdk@0.2.13
```
