import { FlatList, StyleSheet, Text, View } from 'react-native';
import { card, colors, radius, spacing } from '../../lib/theme';

type Friend = { id: string; name: string; status: 'posted' | 'not_posted' };

// Shell only — closed friend-group list, backed by Supabase once auth/social
// graph tables exist.
const PLACEHOLDER_FRIENDS: Friend[] = [];

export default function FriendsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Friends</Text>
      <FlatList
        data={PLACEHOLDER_FRIENDS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>👋</Text>
            <Text style={styles.emptyTitle}>No friends added yet</Text>
            <Text style={styles.emptyBody}>Your closed group shows up here once invited.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.avatar}>
              <Text style={styles.avatarLetter}>{item.name.charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={styles.name}>{item.name}</Text>
            <View style={[styles.badge, item.status === 'posted' ? styles.badgePosted : styles.badgeWaiting]}>
              <Text style={styles.badgeText}>{item.status === 'posted' ? 'Posted' : 'Waiting'}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 60, paddingHorizontal: spacing.md },
  header: { fontSize: 26, fontWeight: '800', color: colors.ink, marginBottom: spacing.md },
  list: { gap: spacing.sm, paddingBottom: spacing.xl },
  row: {
    ...card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { color: colors.ink, fontWeight: '800', fontSize: 13 },
  name: { flex: 1, fontWeight: '700', color: colors.ink },
  badge: {
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.ink,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  badgePosted: { backgroundColor: colors.secondary },
  badgeWaiting: { backgroundColor: colors.surface },
  badgeText: { fontSize: 11, fontWeight: '800', color: colors.ink },
  emptyCard: {
    ...card,
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.xl,
    gap: 4,
  },
  emptyEmoji: { fontSize: 32, marginBottom: spacing.xs },
  emptyTitle: { fontWeight: '800', fontSize: 16, color: colors.ink },
  emptyBody: { color: colors.inkMuted, textAlign: 'center' },
});
