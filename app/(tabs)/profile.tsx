import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSession } from '../../lib/session';
import { supabase } from '../../lib/supabase';
import { card, colors, fonts, radius, spacing } from '../../lib/theme';

// "Blocked users" and "Report history" are placeholders for the minimal
// report/block UI, which is its own Month 1 task.
const SETTINGS_ROWS: { label: string; emoji: string; action?: () => void }[] = [
  { label: 'Blocked users', emoji: '🚫' },
  { label: 'Report history', emoji: '🚩' },
];

export default function ProfileScreen() {
  const { profile } = useSession();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Profile</Text>

      <View style={styles.identityCard}>
        <View style={[styles.avatar, { backgroundColor: profile?.avatar_color ?? colors.primary }]}>
          <Text style={styles.avatarLetter}>{(profile?.username ?? '?').charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.username}>{profile?.username}</Text>
      </View>

      <View style={styles.streakRow}>
        <View style={styles.streakCard}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={styles.streakNumber}>{profile?.current_streak ?? 0}</Text>
          <Text style={styles.streakLabel}>current streak</Text>
        </View>
        <View style={styles.streakCard}>
          <Text style={styles.streakEmoji}>🏆</Text>
          <Text style={styles.streakNumber}>{profile?.longest_streak ?? 0}</Text>
          <Text style={styles.streakLabel}>best streak</Text>
        </View>
      </View>

      <View style={styles.list}>
        {SETTINGS_ROWS.map((row) => (
          <Pressable key={row.label} style={({ pressed }) => [styles.row, pressed && styles.rowPressed]} onPress={row.action}>
            <Text style={styles.emoji}>{row.emoji}</Text>
            <Text style={styles.label}>{row.label}</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}
        <Pressable
          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          onPress={() => supabase.auth.signOut()}
        >
          <Text style={styles.emoji}>👋</Text>
          <Text style={styles.label}>Sign out</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 60, paddingHorizontal: spacing.md },
  header: { fontSize: 28, fontFamily: fonts.extraBold, color: colors.ink, marginBottom: spacing.md },
  identityCard: {
    ...card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { color: colors.ink, fontWeight: '800', fontSize: 18 },
  username: { fontFamily: fonts.extraBold, fontSize: 19, color: colors.ink },
  streakRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  streakCard: { ...card, flex: 1, alignItems: 'center', padding: spacing.md },
  streakEmoji: { fontSize: 22 },
  streakNumber: { fontSize: 26, fontFamily: fonts.extraBold, color: colors.ink, marginTop: 2 },
  streakLabel: { fontSize: 11, color: colors.inkMuted, fontFamily: fonts.bold },
  list: { gap: spacing.sm },
  row: {
    ...card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
  },
  rowPressed: { transform: [{ translateY: 2 }], shadowOffset: { width: 0, height: 0 } },
  emoji: { fontSize: 18 },
  label: { flex: 1, fontFamily: fonts.bold, color: colors.ink, fontSize: 15 },
  chevron: { color: colors.inkMuted, fontSize: 18, fontWeight: '700' },
});
