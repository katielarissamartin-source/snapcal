import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from '../components/Button';
import { useSession } from '../lib/session';
import { supabase } from '../lib/supabase';
import { card, colors, fonts, spacing } from '../lib/theme';

const AVATAR_COLORS = [colors.primary, colors.secondary, colors.accent];

export default function OnboardingScreen() {
  const { session, refreshProfile } = useSession();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProfile = async () => {
    const trimmed = username.trim();
    if (!trimmed || !session?.user) return;
    setLoading(true);
    setError(null);
    const { error: insertError } = await supabase.from('profiles').insert({
      id: session.user.id,
      username: trimmed,
      avatar_color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
    });
    setLoading(false);
    if (insertError) {
      setError(insertError.message.includes('duplicate') ? 'That username is taken.' : insertError.message);
      return;
    }
    await refreshProfile();
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.card}>
        <Text style={styles.emoji}>👋</Text>
        <Text style={styles.title}>Pick a username</Text>
        <Text style={styles.subtitle}>This is what your friends will see.</Text>
        <TextInput
          style={styles.input}
          placeholder="username"
          placeholderTextColor={colors.inkMuted}
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
        />
        {error && <Text style={styles.error}>{error}</Text>}
        {loading ? <ActivityIndicator color={colors.primary} /> : <Button title="Let's go" onPress={createProfile} style={styles.button} />}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  card: { ...card, width: '100%', maxWidth: 360, padding: spacing.xl, alignItems: 'center', gap: spacing.sm },
  emoji: { fontSize: 36 },
  title: { fontSize: 24, fontFamily: fonts.extraBold, color: colors.ink },
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
});
