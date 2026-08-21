import { Pressable, StyleSheet, Text, View } from 'react-native';
import { card, colors, spacing } from '../../lib/theme';

// Shell only. "Blocked users" and "Report history" are placeholders for the
// minimal report/block UI, which is its own Month 1 task.
const SETTINGS_ROWS: { label: string; emoji: string }[] = [
  { label: 'Account', emoji: '🙂' },
  { label: 'Blocked users', emoji: '🚫' },
  { label: 'Report history', emoji: '🚩' },
  { label: 'Sign out', emoji: '👋' },
];

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Profile</Text>
      <View style={styles.list}>
        {SETTINGS_ROWS.map((row) => (
          <Pressable
            key={row.label}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          >
            <Text style={styles.emoji}>{row.emoji}</Text>
            <Text style={styles.label}>{row.label}</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 60, paddingHorizontal: spacing.md },
  header: { fontSize: 26, fontWeight: '800', color: colors.ink, marginBottom: spacing.md },
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
  label: { flex: 1, fontWeight: '700', color: colors.ink, fontSize: 15 },
  chevron: { color: colors.inkMuted, fontSize: 18, fontWeight: '700' },
});
