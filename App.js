import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  feedbackSDKBoot,
  feedbackSDKShow,
  feedbackSDKTrack,
  feedbackSDKClear,
  feedbackSDKDebugMode,
  feedbackSDKViewMode,
} from 'feedback-react-native-sdk';

const DEFAULTS = {
  appId: 'YOUR_APP_ID',
  accessKey: 'YOUR_ACCESS_KEY',
  apiUrl: 'https://api.pisano.co',
  feedbackUrl: 'https://web.pisano.co/web_feedback',
  eventUrl: '',
  language: 'en',
  flowId: '',
  title: 'We Value Your Feedback',
  titleFontSize: 16,
};

const loadLocalConfig = () => {
  // IMPORTANT:
  // Metro needs to be able to statically analyze `require()` calls. A `try/catch`
  // does NOT prevent resolution errors during bundling if the module doesn't exist.
  // We first check with `require.resolve`, then require only if it exists.
  try {
    const resolved = require.resolve('./pisano.config');
    if (resolved) {
      // eslint-disable-next-line global-require
      const mod = require('./pisano.config');
      return mod?.PISANO_CONFIG ?? mod?.default ?? DEFAULTS;
    }
  } catch {
    // ignore: local config doesn't exist
  }
  return DEFAULTS;
};

const toMap = (value) => {
  if (!value || typeof value !== 'object') return new Map();
  return new Map(Object.entries(value));
};

const parseJsonObject = (text) => {
  const trimmed = text.trim();
  if (!trimmed) return { ok: true, value: {} };
  try {
    const v = JSON.parse(trimmed);
    if (!v || typeof v !== 'object' || Array.isArray(v)) {
      return {
        ok: false,
        error: 'Must be a JSON object (e.g. {"key":"value"}).',
      };
    }
    return { ok: true, value: v };
  } catch (e) {
    return { ok: false, error: e?.message ?? 'Invalid JSON.' };
  }
};

export default function App() {
  const config = React.useMemo(() => loadLocalConfig(), []);
  const [debugEnabled, setDebugEnabled] = React.useState(true);
  const [status, setStatus] = React.useState('Idle');
  const [logs, setLogs] = React.useState([]);
  const [bootState, setBootState] = React.useState('idle'); // idle | booting | success | failed

  const [appId, setAppId] = React.useState(config.appId);
  const [accessKey, setAccessKey] = React.useState(config.accessKey);
  const [apiUrl, setApiUrl] = React.useState(config.apiUrl);
  const [feedbackUrl, setFeedbackUrl] = React.useState(config.feedbackUrl);
  const [eventUrl, setEventUrl] = React.useState(config.eventUrl ?? '');

  const [viewMode, setViewMode] = React.useState(feedbackSDKViewMode.BottomSheet);
  const [title, setTitle] = React.useState(config.title ?? DEFAULTS.title ?? '');
  const [titleFontSize, setTitleFontSize] = React.useState(
    String(config.titleFontSize ?? DEFAULTS.titleFontSize ?? 16)
  );
  const [flowId, setFlowId] = React.useState(config.flowId ?? '');
  const [language, setLanguage] = React.useState(config.language ?? '');

  const [customerJson, setCustomerJson] = React.useState('{}');
  const [payloadJson, setPayloadJson] = React.useState('{}');
  const [eventName, setEventName] = React.useState('event');
  const [configError, setConfigError] = React.useState(null);

  const log = (msg) => {
    console.log(msg);
    setStatus(msg);
    setLogs((prev) =>
      [new Date().toLocaleTimeString() + '  ' + msg, ...prev].slice(0, 50)
    );
  };

  const validateAndGetMaps = () => {
    const customerParsed = parseJsonObject(customerJson);
    if (!customerParsed.ok) {
      setConfigError(`Customer JSON: ${customerParsed.error}`);
      return null;
    }
    const payloadParsed = parseJsonObject(payloadJson);
    if (!payloadParsed.ok) {
      setConfigError(`Payload JSON: ${payloadParsed.error}`);
      return null;
    }
    setConfigError(null);
    return {
      customer: toMap(customerParsed.value),
      payload: toMap(payloadParsed.value),
    };
  };

  const handleBoot = () => {
    const maps = validateAndGetMaps();
    if (!maps) return;
    log('Boot started...');
    setBootState('booting');
    feedbackSDKBoot(
      appId.trim(),
      accessKey.trim(),
      apiUrl.trim(),
      feedbackUrl.trim(),
      eventUrl.trim() ? eventUrl.trim() : undefined,
      (s) => {
        log(`Boot callback: ${s}`);
        const normalized = String(s).toLowerCase();
        if (normalized.includes('initsucc')) setBootState('success');
        else if (normalized.includes('initfail')) setBootState('failed');
      }
    );
  };

  const handleShow = () => {
    if (bootState !== 'success') {
      log('Show blocked: call Boot and wait for InitSucces first.');
      return;
    }
    const maps = validateAndGetMaps();
    if (!maps) return;
    log('Show called...');
    const size = Number.isFinite(Number(titleFontSize)) ? Number(titleFontSize) : 0;
    feedbackSDKShow(
      viewMode,
      title.trim() ? title.trim() : null,
      Number.isFinite(size) ? size : 0,
      flowId.trim() ? flowId.trim() : null,
      language.trim() ? language.trim() : null,
      maps.customer,
      maps.payload,
      (result) => {
        log(`Show callback: ${result}`);
      }
    );
  };

  const handleTrack = () => {
    if (bootState !== 'success') {
      log('Track blocked: call Boot and wait for InitSucces first.');
      return;
    }
    const maps = validateAndGetMaps();
    if (!maps) return;
    const name = eventName.trim() || 'event';
    log(`Track called: ${name}`);
    feedbackSDKTrack(
      name,
      maps.payload,
      maps.customer,
      language.trim() || undefined,
      (s) => {
        log(`Track callback: ${s}`);
      }
    );
  };

  const handleClear = () => {
    feedbackSDKClear();
    log('Clear called');
    setBootState('idle');
  };

  React.useEffect(() => {
    feedbackSDKDebugMode(debugEnabled);
    log(`Debug mode ${debugEnabled ? 'enabled' : 'disabled'}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debugEnabled]);

  const Section = ({ title: sectionTitle, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{sectionTitle}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );

  const ActionButton = ({
    title: btnTitle,
    onPress,
    variant = 'primary',
    disabled = false,
  }) => (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        variant === 'secondary' && styles.buttonSecondary,
        variant === 'danger' && styles.buttonDanger,
        disabled && styles.buttonDisabled,
        pressed && !disabled && { opacity: 0.85 },
      ]}
    >
      <Text style={styles.buttonText}>{btnTitle}</Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pisano Feedback SDK</Text>
        <Text style={styles.headerSubtitle}>React Native Sample</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Section title="Configuration">
            <View style={styles.rowBetween}>
              <Text style={styles.label}>Debug mode</Text>
              <Switch value={debugEnabled} onValueChange={setDebugEnabled} />
            </View>

            <Text style={styles.label}>App ID</Text>
            <TextInput
              value={appId}
              onChangeText={setAppId}
              style={styles.input}
              autoCapitalize="none"
            />

            <Text style={styles.label}>Access Key</Text>
            <TextInput
              value={accessKey}
              onChangeText={setAccessKey}
              style={styles.input}
              autoCapitalize="none"
              secureTextEntry
            />

            <Text style={styles.label}>API URL</Text>
            <TextInput
              value={apiUrl}
              onChangeText={setApiUrl}
              style={styles.input}
              autoCapitalize="none"
            />

            <Text style={styles.label}>Feedback URL</Text>
            <TextInput
              value={feedbackUrl}
              onChangeText={setFeedbackUrl}
              style={styles.input}
              autoCapitalize="none"
            />

            <Text style={styles.label}>Event URL (optional)</Text>
            <TextInput
              value={eventUrl}
              onChangeText={setEventUrl}
              style={styles.input}
              autoCapitalize="none"
              placeholder="Leave empty if not used"
              placeholderTextColor="#9CA3AF"
            />

            <View style={styles.divider} />

            <Text style={styles.label}>View mode</Text>
            <View style={styles.segment}>
              <Pressable
                onPress={() => setViewMode(feedbackSDKViewMode.Default)}
                style={[
                  styles.segmentItem,
                  viewMode === feedbackSDKViewMode.Default && styles.segmentItemActive,
                ]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    viewMode === feedbackSDKViewMode.Default && styles.segmentTextActive,
                  ]}
                >
                  Default
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setViewMode(feedbackSDKViewMode.BottomSheet)}
                style={[
                  styles.segmentItem,
                  viewMode === feedbackSDKViewMode.BottomSheet && styles.segmentItemActive,
                ]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    viewMode === feedbackSDKViewMode.BottomSheet && styles.segmentTextActive,
                  ]}
                >
                  Bottom sheet
                </Text>
              </Pressable>
            </View>

            <View style={styles.row2}>
              <View style={styles.col}>
                <Text style={styles.label}>Language</Text>
                <TextInput
                  value={language}
                  onChangeText={setLanguage}
                  style={styles.input}
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>Flow ID (optional)</Text>
                <TextInput
                  value={flowId}
                  onChangeText={setFlowId}
                  style={styles.input}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <Text style={styles.label}>Title (optional)</Text>
            <TextInput value={title} onChangeText={setTitle} style={styles.input} />

            <Text style={styles.label}>Title font size (optional)</Text>
            <TextInput
              value={titleFontSize}
              onChangeText={setTitleFontSize}
              style={styles.input}
              keyboardType="number-pad"
              placeholder="16"
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.label}>Customer JSON</Text>
            <TextInput
              value={customerJson}
              onChangeText={setCustomerJson}
              style={[styles.input, styles.textarea]}
              autoCapitalize="none"
              multiline
            />

            <Text style={styles.label}>Payload JSON</Text>
            <TextInput
              value={payloadJson}
              onChangeText={setPayloadJson}
              style={[styles.input, styles.textarea]}
              autoCapitalize="none"
              multiline
            />

            {configError && <Text style={styles.errorText}>{configError}</Text>}
          </Section>

          <Section title="Actions">
            <View style={styles.actionsRow}>
              <ActionButton
                title={bootState === 'booting' ? 'Booting…' : 'Boot'}
                onPress={handleBoot}
                disabled={bootState === 'booting'}
              />
              <ActionButton
                title="Show"
                onPress={handleShow}
                variant="secondary"
                disabled={bootState !== 'success'}
              />
            </View>

            <Text style={styles.label}>Track event name</Text>
            <TextInput
              value={eventName}
              onChangeText={setEventName}
              style={styles.input}
              autoCapitalize="none"
            />

            <View style={styles.actionsRow}>
              <ActionButton title="Track" onPress={handleTrack} disabled={bootState !== 'success'} />
              <ActionButton title="Clear" onPress={handleClear} variant="danger" />
            </View>
          </Section>

          <Section title="Status & Logs">
            <Text style={styles.status}>Status: {status}</Text>
            <Text style={styles.hint}>
              Boot state: {bootState === 'success' ? 'InitSucces' : bootState}
            </Text>
            <View style={styles.logsBox}>
              {logs.length === 0 ? (
                <Text style={styles.hint}>Logs will appear here.</Text>
              ) : (
                logs.map((l, idx) => (
                  <Text key={`${l}-${idx}`} style={styles.logLine}>
                    {l}
                  </Text>
                ))
              )}
            </View>
          </Section>

          <Text style={styles.footerHint}>
            Tip: If you change native configuration, run a clean build and re-run `pod install`
            (iOS).
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: '#E11D48',
  },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: '700' },
  headerSubtitle: { color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  container: {
    padding: 16,
    paddingBottom: 28,
  },
  section: { marginTop: 14 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  label: {
    marginTop: 10,
    marginBottom: 6,
    color: '#111827',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    backgroundColor: '#F9FAFB',
    color: '#111827',
  },
  textarea: { minHeight: 84, textAlignVertical: 'top' },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginTop: 14 },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  row2: { flexDirection: 'row', gap: 12 },
  col: { flex: 1 },
  segment: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F9FAFB',
  },
  segmentItem: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  segmentItemActive: { backgroundColor: '#111827' },
  segmentText: { color: '#111827', fontWeight: '700' },
  segmentTextActive: { color: 'white' },
  actionsRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  button: {
    flex: 1,
    backgroundColor: '#111827',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonSecondary: { backgroundColor: '#2563EB' },
  buttonDanger: { backgroundColor: '#DC2626' },
  buttonDisabled: { opacity: 0.45 },
  buttonText: { color: 'white', fontWeight: '800' },
  status: { marginTop: 6, color: '#111827', fontWeight: '700' },
  logsBox: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 10,
    backgroundColor: '#0B1220',
    minHeight: 120,
  },
  logLine: {
    color: '#E5E7EB',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    marginBottom: 4,
  },
  hint: { color: '#9CA3AF' },
  errorText: { marginTop: 10, color: '#DC2626', fontWeight: '700' },
  footerHint: { marginTop: 14, color: '#6B7280', textAlign: 'center' },
});