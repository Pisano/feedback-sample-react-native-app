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
  feedbackSDKClear,
  feedbackSDKDebugMode,
  feedbackSDKHealthCheck,
  feedbackSDKShow,
  feedbackSDKTrack,
  feedbackSDKViewMode,
} from 'feedback-react-native-sdk';
// Credentials live in src/pisano.config.ts (git-ignored). `yarn` creates it
// from pisano.config.example.ts on first install — edit it with your own
// Pisano test values, or type them into the fields at runtime.
import { PISANO_CONFIG } from './pisano.config';

type Config = {
  appId: string;
  accessKey: string;
  apiUrl: string;
  feedbackUrl: string;
  eventUrl: string;
  title: string;
  titleFontSize: string;
  language: string;
  code: string;
  customerId: string;
  customerEmail: string;
  customerPhone: string;
  payloadScreen: string;
  payloadOrderId: string;
};

const INITIAL_CONFIG: Config = {
  appId: PISANO_CONFIG.appId,
  accessKey: PISANO_CONFIG.accessKey,
  apiUrl: PISANO_CONFIG.apiUrl,
  feedbackUrl: PISANO_CONFIG.feedbackUrl,
  eventUrl: PISANO_CONFIG.eventUrl ?? '',
  title: PISANO_CONFIG.title ?? '',
  titleFontSize: String(PISANO_CONFIG.titleFontSize ?? 16),
  language: PISANO_CONFIG.language ?? '',
  code: PISANO_CONFIG.code ?? '',
  customerId: '',
  customerEmail: '',
  customerPhone: '',
  payloadScreen: 'Checkout',
  payloadOrderId: '',
};

type BootState = 'idle' | 'booting' | 'success' | 'failed';

// ---------------------------------------------------------------------------
// Presentational pieces. Each is memo'd and takes stable callbacks, so typing
// in one field — or a new log line — does not re-render the rest of the tree.
// ---------------------------------------------------------------------------

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.card}>{children}</View>
  </View>
);

type FieldProps = {
  name: keyof Config;
  label: string;
  value: string;
  onChange: (name: keyof Config, value: string) => void;
} & Pick<
  React.ComponentProps<typeof TextInput>,
  'placeholder' | 'secureTextEntry' | 'keyboardType'
>;

const Field = React.memo(function FieldInner({
  name,
  label,
  value,
  onChange,
  ...inputProps
}: FieldProps) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={(text) => onChange(name, text)}
        style={styles.input}
        autoCapitalize="none"
        placeholderTextColor="#9CA3AF"
        {...inputProps}
      />
    </>
  );
});

type SegmentValue = string | number | boolean;

type SegmentProps<T extends SegmentValue> = {
  label: string;
  value: T;
  options: { label: string; value: T }[];
  onChange: (value: T) => void;
};

function SegmentInner<T extends SegmentValue>({
  label,
  value,
  options,
  onChange,
}: SegmentProps<T>) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.segment}>
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <Pressable
              key={opt.label}
              onPress={() => onChange(opt.value)}
              style={[styles.segmentItem, active && styles.segmentItemActive]}
            >
              <Text
                style={[
                  styles.segmentText,
                  active && styles.segmentTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </>
  );
}

// React.memo drops the generic signature, so re-assert it on the wrapper.
const Segment = React.memo(SegmentInner) as <T extends SegmentValue>(
  props: SegmentProps<T>
) => React.ReactElement;

const ActionButton = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    style={({ pressed }) => [
      styles.button,
      variant === 'secondary' && styles.buttonSecondary,
      variant === 'danger' && styles.buttonDanger,
      disabled && styles.buttonDisabled,
      pressed && !disabled && styles.buttonPressed,
    ]}
  >
    <Text style={styles.buttonText}>{title}</Text>
  </Pressable>
);

const VIEW_MODE_OPTIONS = [
  { label: 'Default', value: feedbackSDKViewMode.Default },
  { label: 'Bottom sheet', value: feedbackSDKViewMode.BottomSheet },
];
const DISMISS_OPTIONS = [
  { label: 'Off', value: false },
  { label: 'On', value: true },
];

const ConfigCard = React.memo(function ConfigCardInner({
  config,
  onChange,
  debugEnabled,
  onToggleDebug,
  viewMode,
  onViewMode,
  dismissOnDrag,
  onDismissOnDrag,
}: {
  config: Config;
  onChange: (name: keyof Config, value: string) => void;
  debugEnabled: boolean;
  onToggleDebug: (value: boolean) => void;
  viewMode: feedbackSDKViewMode;
  onViewMode: (value: feedbackSDKViewMode) => void;
  dismissOnDrag: boolean;
  onDismissOnDrag: (value: boolean) => void;
}) {
  return (
    <Section title="Configuration">
      <View style={styles.rowBetween}>
        <Text style={styles.label}>Debug mode</Text>
        <Switch value={debugEnabled} onValueChange={onToggleDebug} />
      </View>

      <Field name="appId" label="App ID" value={config.appId} onChange={onChange} />
      <Field
        name="accessKey"
        label="Access Key"
        value={config.accessKey}
        onChange={onChange}
        secureTextEntry
      />
      <Field name="apiUrl" label="API URL" value={config.apiUrl} onChange={onChange} />
      <Field
        name="feedbackUrl"
        label="Feedback URL"
        value={config.feedbackUrl}
        onChange={onChange}
      />
      <Field
        name="eventUrl"
        label="Event URL (optional)"
        value={config.eventUrl}
        onChange={onChange}
        placeholder="Leave empty if not used"
      />

      <View style={styles.divider} />

      <Segment
        label="View mode"
        value={viewMode}
        options={VIEW_MODE_OPTIONS}
        onChange={onViewMode}
      />
      <Segment
        label="Dismiss on drag (bottom sheet)"
        value={dismissOnDrag}
        options={DISMISS_OPTIONS}
        onChange={onDismissOnDrag}
      />

      <View style={styles.row2}>
        <View style={styles.col}>
          <Field
            name="language"
            label="Language"
            value={config.language}
            onChange={onChange}
          />
        </View>
        <View style={styles.col}>
          <Field
            name="code"
            label="Code"
            value={config.code}
            onChange={onChange}
            placeholder="e.g. PSN-xxxxx"
          />
        </View>
      </View>

      <Field
        name="title"
        label="Title (optional)"
        value={config.title}
        onChange={onChange}
      />
      <Field
        name="titleFontSize"
        label="Title font size (optional)"
        value={config.titleFontSize}
        onChange={onChange}
        keyboardType="number-pad"
        placeholder="16"
      />

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>Customer</Text>
      <Field
        name="customerId"
        label="Customer ID"
        value={config.customerId}
        onChange={onChange}
        placeholder="12345"
      />
      <Field
        name="customerEmail"
        label="Email"
        value={config.customerEmail}
        onChange={onChange}
        keyboardType="email-address"
        placeholder="user@example.com"
      />
      <Field
        name="customerPhone"
        label="Phone"
        value={config.customerPhone}
        onChange={onChange}
        keyboardType="phone-pad"
        placeholder="+905551112233"
      />

      <Text style={styles.sectionTitle}>Payload</Text>
      <Field
        name="payloadScreen"
        label="Screen"
        value={config.payloadScreen}
        onChange={onChange}
        placeholder="Checkout"
      />
      <Field
        name="payloadOrderId"
        label="Order ID"
        value={config.payloadOrderId}
        onChange={onChange}
        placeholder="ORD-987"
      />
    </Section>
  );
});

const ActionsCard = React.memo(function ActionsCardInner({
  bootState,
  onBoot,
  onShow,
  onHealthCheck,
  onTrack,
  onClear,
}: {
  bootState: BootState;
  onBoot: () => void;
  onShow: () => void;
  onHealthCheck: () => void;
  onTrack: () => void;
  onClear: () => void;
}) {
  const booted = bootState === 'success';
  return (
    <Section title="Actions">
      <View style={styles.actionsRow}>
        <ActionButton
          title={bootState === 'booting' ? 'Booting...' : 'Boot'}
          onPress={onBoot}
          disabled={bootState === 'booting'}
        />
        <ActionButton
          title="Show"
          onPress={onShow}
          variant="secondary"
          disabled={!booted}
        />
      </View>
      <View style={styles.actionsRow}>
        <ActionButton
          title="Health check"
          onPress={onHealthCheck}
          disabled={!booted}
        />
        <ActionButton title="Track event" onPress={onTrack} disabled={!booted} />
      </View>
      <View style={styles.actionsRow}>
        <ActionButton title="Clear" onPress={onClear} variant="danger" />
      </View>
    </Section>
  );
});

const StatusCard = React.memo(function StatusCardInner({
  status,
  bootState,
  logs,
}: {
  status: string;
  bootState: BootState;
  logs: string[];
}) {
  return (
    <Section title="Status & Logs">
      <Text style={styles.status}>Status: {status}</Text>
      <Text style={styles.hint}>Boot state: {bootState}</Text>
      <View style={styles.logsBox}>
        {logs.length === 0 ? (
          <Text style={styles.hint}>Logs will appear here.</Text>
        ) : (
          logs.map((line, idx) => (
            <Text key={`${idx}-${line}`} style={styles.logLine}>
              {line}
            </Text>
          ))
        )}
      </View>
    </Section>
  );
});

// ---------------------------------------------------------------------------

const toMap = <V,>(obj: Record<string, V>): Map<string, V> =>
  new Map(Object.entries(obj));

const mergeConfig = (state: Config, patch: Partial<Config>): Config => ({
  ...state,
  ...patch,
});

export default function App() {
  const [debugEnabled, setDebugEnabled] = React.useState(true);
  const [bootState, setBootState] = React.useState<BootState>('idle');
  const [status, setStatus] = React.useState('Idle');
  const [logs, setLogs] = React.useState<string[]>([]);
  const [viewMode, setViewMode] = React.useState<feedbackSDKViewMode>(
    feedbackSDKViewMode.BottomSheet
  );
  const [dismissOnDrag, setDismissOnDrag] = React.useState(false);
  const [config, patchConfig] = React.useReducer(mergeConfig, INITIAL_CONFIG);

  // Handlers read the latest values through refs so they stay referentially
  // stable — ActionsCard never re-renders just because a field changed.
  const configRef = React.useRef(config);
  configRef.current = config;
  const viewModeRef = React.useRef(viewMode);
  viewModeRef.current = viewMode;
  const dismissOnDragRef = React.useRef(dismissOnDrag);
  dismissOnDragRef.current = dismissOnDrag;
  const bootStateRef = React.useRef(bootState);
  bootStateRef.current = bootState;

  const log = React.useCallback((msg: string) => {
    console.log(msg);
    setStatus(msg);
    setLogs((prev) =>
      [`${new Date().toLocaleTimeString()}  ${msg}`, ...prev].slice(0, 50)
    );
  }, []);

  const onChangeField = React.useCallback(
    (name: keyof Config, value: string) =>
      patchConfig({ [name]: value } as Partial<Config>),
    []
  );

  const handleBoot = React.useCallback(async () => {
    const c = configRef.current;
    if (!c.code.trim()) {
      log('Boot blocked: code is required.');
      setBootState('idle');
      return;
    }
    log('Boot started...');
    setBootState('booting');
    const bootStatus = await feedbackSDKBoot({
      appId: c.appId.trim(),
      accessKey: c.accessKey.trim(),
      code: c.code.trim(),
      apiUrl: c.apiUrl.trim(),
      feedbackUrl: c.feedbackUrl.trim(),
      eventUrl: c.eventUrl.trim() || undefined,
    });
    log(`Boot callback: ${bootStatus}`);
    setBootState(String(bootStatus).includes('Success') ? 'success' : 'failed');
  }, [log]);

  const handleShow = React.useCallback(async () => {
    if (bootStateRef.current !== 'success') {
      log('Show blocked: Boot first.');
      return;
    }
    const c = configRef.current;
    const customer: Record<string, string> = {};
    if (c.customerId.trim()) customer.externalId = c.customerId.trim();
    if (c.customerEmail.trim()) customer.email = c.customerEmail.trim();
    if (c.customerPhone.trim()) customer.phoneNumber = c.customerPhone.trim();

    const payload: Record<string, string> = {
      order_id: c.payloadOrderId.trim() || 'ORD-RN-DEMO-001',
    };
    if (c.payloadScreen.trim()) payload.screen = c.payloadScreen.trim();

    const size = Number(c.titleFontSize);
    log(`Show called (dismissOnDrag=${dismissOnDragRef.current})...`);
    const result = await feedbackSDKShow({
      viewMode: viewModeRef.current,
      title: c.title.trim() || null,
      titleFontSize: Number.isFinite(size) ? size : 0,
      code: c.code.trim() || null,
      language: c.language.trim() || null,
      customer: toMap(customer),
      payload: toMap(payload),
      dismissOnDrag: dismissOnDragRef.current,
    });
    log(`Show callback: ${result}`);
  }, [log]);

  const buildCustomer = React.useCallback(() => {
    const c = configRef.current;
    const customer: Record<string, string> = {};
    if (c.customerId.trim()) customer.externalId = c.customerId.trim();
    if (c.customerEmail.trim()) customer.email = c.customerEmail.trim();
    if (c.customerPhone.trim()) customer.phoneNumber = c.customerPhone.trim();
    return customer;
  }, []);

  const handleHealthCheck = React.useCallback(async () => {
    if (bootStateRef.current !== 'success') {
      log('Health check blocked: Boot first.');
      return;
    }
    const c = configRef.current;
    log('Health check called...');
    const canShow = await feedbackSDKHealthCheck({
      code: c.code.trim() || null,
      language: c.language.trim() || null,
      customer: toMap(buildCustomer()),
    });
    log(`Health check: ${canShow ? 'a survey would show' : 'no survey'}`);
  }, [log, buildCustomer]);

  const handleTrack = React.useCallback(() => {
    if (bootStateRef.current !== 'success') {
      log('Track blocked: Boot first.');
      return;
    }
    const c = configRef.current;
    feedbackSDKTrack({
      event: 'sample_app_event',
      language: c.language.trim() || null,
      customer: toMap(buildCustomer()),
      payload: { screen: c.payloadScreen.trim() || 'Sample' },
    });
    log("Track event sent ('sample_app_event') — a triggered survey opens on its own");
  }, [log, buildCustomer]);

  const handleClear = React.useCallback(() => {
    feedbackSDKClear();
    log('Clear called');
    setBootState('idle');
  }, [log]);

  React.useEffect(() => {
    feedbackSDKDebugMode(debugEnabled);
    log(`Debug mode ${debugEnabled ? 'enabled' : 'disabled'}`);
  }, [debugEnabled, log]);

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
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <ConfigCard
            config={config}
            onChange={onChangeField}
            debugEnabled={debugEnabled}
            onToggleDebug={setDebugEnabled}
            viewMode={viewMode}
            onViewMode={setViewMode}
            dismissOnDrag={dismissOnDrag}
            onDismissOnDrag={setDismissOnDrag}
          />
          <ActionsCard
            bootState={bootState}
            onBoot={handleBoot}
            onShow={handleShow}
            onHealthCheck={handleHealthCheck}
            onTrack={handleTrack}
            onClear={handleClear}
          />
          <StatusCard status={status} bootState={bootState} logs={logs} />
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
  container: { padding: 16, paddingBottom: 28 },
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
  buttonPressed: { opacity: 0.85 },
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
});
