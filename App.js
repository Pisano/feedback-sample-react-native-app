import React from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  feedbackSDKBoot,
  feedbackSDKClear,
  feedbackSDKDebugMode,
  feedbackSDKShowStyled,
  feedbackSDKViewMode,
} from 'feedback-react-native-sdk';
import {PISANO_CONFIG} from './pisano.config';

const DEFAULTS = {
  appId: 'YOUR_APP_ID',
  accessKey: 'YOUR_ACCESS_KEY',
  apiUrl: 'https://api.pisano.co',
  feedbackUrl: 'https://web.pisano.co/web_feedback',
  eventUrl: '',
};

const loadConfig = () => PISANO_CONFIG ?? DEFAULTS;

const Logo = () => (
  <View style={styles.logoWrap}>
    {/* No bundled Pisano logo asset in this repo; keeping a clean text logo. */}
    <Text style={styles.logoText}>Pisano</Text>
  </View>
);

const PrimaryButton = ({title, onPress, disabled}) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    style={({pressed}) => [
      styles.primaryButton,
      disabled && styles.primaryButtonDisabled,
      pressed && !disabled && {opacity: 0.9},
    ]}
  >
    <Text style={styles.primaryButtonText}>{title}</Text>
  </Pressable>
);

const LinkButton = ({title, onPress}) => (
  <Pressable onPress={onPress} style={({pressed}) => [pressed && {opacity: 0.6}]}>
    <Text style={styles.linkText}>{title}</Text>
  </Pressable>
);

const Segmented = ({left, right, value, onChange}) => (
  <View style={styles.segmentWrap}>
    <Pressable
      onPress={() => onChange(left.value)}
      style={[styles.segmentItem, value === left.value && styles.segmentItemActive]}
    >
      <Text style={[styles.segmentText, value === left.value && styles.segmentTextActive]}>
        {left.label}
      </Text>
    </Pressable>
    <Pressable
      onPress={() => onChange(right.value)}
      style={[styles.segmentItem, value === right.value && styles.segmentItemActive]}
    >
      <Text style={[styles.segmentText, value === right.value && styles.segmentTextActive]}>
        {right.label}
      </Text>
    </Pressable>
  </View>
);

const ColorSwatches = ({colors, value, onChange}) => (
  <View style={styles.swatchRow}>
    {colors.map((c) => {
      const selected = value === c;
      return (
        <Pressable
          key={c}
          onPress={() => onChange(c)}
          style={[
            styles.swatch,
            {backgroundColor: c},
            selected && styles.swatchSelected,
          ]}
        >
          {selected ? <Text style={styles.swatchCheck}>✓</Text> : null}
        </Pressable>
      );
    })}
  </View>
);

function useAnimatedBackground() {
  const progress = React.useRef(new Animated.Value(0)).current;
  const [pair, setPair] = React.useState([0, 1]);
  const colors = React.useMemo(
    () => ['#F1F8FF', '#F2ECFF', '#EFFAF2', '#FFF6E7', '#EEF7F7'],
    []
  );

  React.useEffect(() => {
    let cancelled = false;
    const loop = () => {
      progress.setValue(0);
      Animated.timing(progress, {
        toValue: 1,
        duration: 2800,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: false,
      }).start(({finished}) => {
        if (!finished || cancelled) return;
        setPair(([a, b]) => {
          const next = (b + 1) % colors.length;
          return [b, next];
        });
      });
    };
    loop();
    const id = setInterval(loop, 2800);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [colors.length, progress]);

  const backgroundColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [colors[pair[0]], colors[pair[1]]],
  });

  return {backgroundColor};
}

const GettingStartedCard = ({onPress}) => (
  <View style={styles.heroCard}>
    <Text style={styles.heroH1}>Feedback</Text>
    <Text style={styles.heroH2}>
      forms <Text style={styles.heroSlash}>\\</Text> flows
    </Text>
    <Text style={styles.heroH1}>for business</Text>

    <View style={{marginTop: 18}}>
      <PrimaryButton title="Getting Started" onPress={onPress} />
    </View>

    <Text style={styles.heroCaption}>Interact with flows made by Pisano</Text>
  </View>
);

const Field = ({label, value, onChangeText, placeholder, keyboardType}) => (
  <View style={{marginTop: 14}}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#B8B8B8"
      style={styles.fieldInput}
      autoCapitalize="none"
      keyboardType={keyboardType}
    />
  </View>
);

export default function App() {
  const cfg = React.useMemo(() => loadConfig(), []);
  const bg = useAnimatedBackground();

  const [screen, setScreen] = React.useState('splash'); // splash | main | detail

  // Form fields (UIKit sample style)
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [externalId, setExternalId] = React.useState('');
  const [customTitle, setCustomTitle] = React.useState('');
  const [viewMode, setViewMode] = React.useState('Default'); // Default | BottomSheet
  const [titleColor, setTitleColor] = React.useState('#BDBDBD'); // UI-only
  const [titleFont, setTitleFont] = React.useState('Title'); // Title | Body (UI-only mapping to fontSize)

  const [status, setStatus] = React.useState('-');
  const [booted, setBooted] = React.useState(false);

  const setStatusLine = (s) => setStatus(String(s ?? '-'));

  // Auto-splash
  React.useEffect(() => {
    const t = setTimeout(() => setScreen('main'), 700);
    return () => clearTimeout(t);
  }, []);

  // Enable SDK debug logs in dev by default (UIKit sample toggles this via DEBUG).
  React.useEffect(() => {
    feedbackSDKDebugMode(true);
  }, []);

  // Boot once (UIKit sample does this at app start in AppDelegate)
  React.useEffect(() => {
    if (booted) return;
    const appId = (cfg.appId ?? '').trim();
    const accessKey = (cfg.accessKey ?? '').trim();
    if (!appId || !accessKey || appId === 'YOUR_APP_ID' || accessKey === 'YOUR_ACCESS_KEY') {
      setStatusLine('Status: missing credentials');
      return;
    }

    feedbackSDKBoot(
      appId,
      accessKey,
      (cfg.apiUrl ?? '').trim(),
      (cfg.feedbackUrl ?? '').trim(),
      (cfg.eventUrl ?? '').trim() ? (cfg.eventUrl ?? '').trim() : undefined,
      (s) => {
        setStatusLine(`Boot: ${s}`);
      }
    );
    setBooted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booted]);

  const handleGetFeedback = () => {
    // Build customer map like UIKit sample fields.
    const customer = new Map();
    if (name.trim()) customer.set('name', name.trim());
    if (email.trim()) customer.set('email', email.trim());
    if (phone.trim()) customer.set('phone', phone.trim());
    if (externalId.trim()) customer.set('externalId', externalId.trim());

    // Payload is optional, but we send UI selections so flows/analytics can use them.
    // We send UI selections both as:
    // - native title styling (via `feedbackSDKShowStyled` on iOS)
    // - payload keys for flows/analytics
    const payload = new Map();
    payload.set('uiTitleColor', titleColor); // hex
    payload.set('uiTitleFont', titleFont); // Title | Body
    payload.set('uiViewMode', viewMode); // Default | BottomSheet

    const mode =
      viewMode === 'BottomSheet' ? feedbackSDKViewMode.BottomSheet : feedbackSDKViewMode.Default;

    // Title UI -> SDK
    const title = customTitle.trim() ? customTitle.trim() : null;
    const titleFontSize = titleFont === 'Title' ? 20 : 16;

    feedbackSDKShowStyled(
      mode,
      title,
      titleFontSize,
      titleColor,
      titleFont,
      null,
      'en',
      customer,
      payload,
      (result) => {
      setStatusLine(`Show: ${result}`);
      }
    );
  };

  const handleClear = () => {
    feedbackSDKClear();
    setName('');
    setEmail('');
    setPhone('');
    setExternalId('');
    setCustomTitle('');
    setViewMode('Default');
    setTitleColor('#BDBDBD');
    setTitleFont('Title');
    setStatusLine('-');
  };

  if (screen === 'main') {
    return (
      <Animated.View style={[styles.bg, {backgroundColor: bg.backgroundColor}]}>
        <SafeAreaView style={styles.safe}>
          <Logo />
          <View style={styles.centerWrap}>
            <GettingStartedCard onPress={() => setScreen('detail')} />
          </View>
        </SafeAreaView>
      </Animated.View>
    );
  }

  if (screen === 'detail') {
    return (
      <Animated.View style={[styles.bg, {backgroundColor: bg.backgroundColor}]}>
        <SafeAreaView style={styles.safe}>
          <Logo />
          <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <ScrollView contentContainerStyle={styles.formWrap} keyboardShouldPersistTaps="handled">
              <View style={styles.formCard}>
                <Field label="Name" value={name} onChangeText={setName} />
                <Field
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="email@address.com"
          keyboardType="email-address"
                />
                <Field
                  label="Phone"
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="01234567890"
          keyboardType="phone-pad"
        />
                <Field label="External Id" value={externalId} onChangeText={setExternalId} />
                <Field label="Custom Title" value={customTitle} onChangeText={setCustomTitle} />

                <Text style={styles.fieldLabel}>View Mode</Text>
                <Segmented
                  left={{label: 'Default', value: 'Default'}}
                  right={{label: 'BottomSheet', value: 'BottomSheet'}}
                  value={viewMode}
                  onChange={setViewMode}
                />

                <Text style={styles.fieldLabel}>Custom Title Color</Text>
                <ColorSwatches
                  colors={[
                    '#BDBDBD',
                    '#007AFF',
                    '#34C759',
                    '#FFCC00',
                    '#8E8E93',
                    '#D1D1D6',
                    '#7D7D7D',
                    '#FF9500',
                  ]}
                  value={titleColor}
                  onChange={setTitleColor}
                />

                <Text style={styles.fieldLabel}>Title Font</Text>
                <Segmented
                  left={{label: 'Title', value: 'Title'}}
                  right={{label: 'Body', value: 'Body'}}
                  value={titleFont}
                  onChange={setTitleFont}
                />

                <View style={{marginTop: 18}}>
                  <PrimaryButton title="Get Feedback" onPress={handleGetFeedback} />
        </View>

                <View style={{marginTop: 18, alignItems: 'center'}}>
                  <LinkButton title="Clear" onPress={handleClear} />
                </View>

                <Text style={styles.statusLine}>Status: {status}</Text>
        </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Animated.View>
    );
  }

  // splash
  return (
    <Animated.View style={[styles.bg, {backgroundColor: bg.backgroundColor}]}>
      <SafeAreaView style={[styles.safe, {justifyContent: 'center'}]}>
        <Logo />
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bg: {flex: 1},
  flex: {flex: 1},
  safe: {flex: 1},

  logoWrap: {alignItems: 'center', marginTop: 18},
  logoText: {fontSize: 44, fontWeight: '800', color: '#1F2A37', letterSpacing: 0.5},

  centerWrap: {flex: 1, paddingHorizontal: 18, justifyContent: 'center'},

  heroCard: {
    backgroundColor: 'white',
    borderRadius: 22,
    padding: 22,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: {width: 0, height: 10},
    elevation: 6,
  },
  heroH1: {fontSize: 34, fontWeight: '900', color: '#111827'},
  heroH2: {fontSize: 38, fontWeight: '900', color: '#007AFF', marginTop: 2},
  heroSlash: {color: '#111827'},
  heroCaption: {marginTop: 16, color: '#6B7280', fontSize: 14},

  primaryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonDisabled: {opacity: 0.6},
  primaryButtonText: {color: 'white', fontWeight: '800', fontSize: 18},

  linkText: {fontSize: 18, fontWeight: '700', color: '#111827'},

  formWrap: {padding: 18, paddingBottom: 30},
  formCard: {
    backgroundColor: 'white',
    borderRadius: 22,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: {width: 0, height: 8},
    elevation: 4,
  },
  fieldLabel: {fontSize: 18, fontWeight: '800', color: '#111827', marginTop: 16},
  fieldInput: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 18,
    backgroundColor: 'white',
    color: '#111827',
  },

  segmentWrap: {
    marginTop: 12,
    flexDirection: 'row',
    backgroundColor: '#EAEAEA',
    borderRadius: 10,
    padding: 3,
  },
  segmentItem: {flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center'},
  segmentItemActive: {backgroundColor: 'white'},
  segmentText: {fontSize: 16, fontWeight: '800', color: '#111827'},
  segmentTextActive: {color: '#111827'},

  swatchRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12},
  swatch: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchSelected: {borderWidth: 2, borderColor: '#A7C8FF'},
  swatchCheck: {fontSize: 22, fontWeight: '900', color: 'white'},

  statusLine: {marginTop: 22, color: '#9CA3AF', fontSize: 16},
});


