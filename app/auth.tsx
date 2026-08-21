import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from '../components/Button';
import { supabase } from '../lib/supabase';
import { card, colors, fonts, spacing } from '../lib/theme';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [stage, setStage] = useState<'email' | 'code'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendCode = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    const { error: otpError } = await supabase.auth.signInWithOtp({ email: email.trim() });
    setLoading(false);
    if (otpError) {
      setError(otpError.message);
      return;
    }
    setStage('code');
  };

  const verifyCode = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: 'email',
    });
    setLoading(false);
    if (verifyError) setError(verifyError.message);
    // On success, SessionProvider's onAuthStateChange picks up the new
    // session and RootNavigator routes onward automatically.
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.emoji}>🎉</Text>
        <Text style={styles.title}>Snapcal</Text>
        <Text style={styles.subtitle}>
          {stage === 'email' ? "What's your email?" : `Enter the code sent to ${email.trim()}`}
        </Text>

        {stage === 'email' ? (
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor={colors.inkMuted}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        ) : (
          <TextInput
            style={styles.input}
            placeholder="123456"
            placeholderTextColor={colors.inkMuted}
            keyboardType="number-pad"
            value={code}
            onChangeText={setCode}
          />
        )}

        {error && <Text style={styles.error}>{error}</Text>}

        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <Button
            title={stage === 'email' ? 'Send code' : 'Verify'}
            onPress={stage === 'email' ? sendCode : verifyCode}
            style={styles.button}
          />
        )}

        {stage === 'code' && (
          <Text style={styles.switchStage} onPress={() => setStage('email')}>
            Use a different email
          </Text>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  card: { ...card, width: '100%', maxWidth: 360, padding: spacing.xl, alignItems: 'center', gap: spacing.sm },
  emoji: { fontSize: 36 },
  title: { fontSize: 28, fontFamily: fonts.extraBold, color: colors.ink },
  subtitle: { color: colors.inkMuted, textAlign: 'center', marginBottom: spacing.sm },
  input: {
    width: '100%',
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.background,
    marginBottom: spacing.sm,
  },
  button: { width: '100%' },
  error: { color: colors.danger, textAlign: 'center', marginBottom: spacing.sm },
  switchStage: { color: colors.inkMuted, marginTop: spacing.md, textDecorationLine: 'underline' },
});
