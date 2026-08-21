import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useSession } from '../../lib/session';
import { supabase } from '../../lib/supabase';
import { card, colors, fonts, radius, spacing } from '../../lib/theme';

type FriendRow = { id: string; name: string; color: string; streak: number; posted: boolean };

function todayUTCDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function FriendsScreen() {
  const { session } = useSession();
  const [friends, setFriends] = useState<FriendRow[] | null>(null);

  const load = useCallback(async () => {
    const [{ data: profiles }, { data: postedToday }] = await Promise.all([
      supabase.from('profiles').select('id, username, avatar_color, current_streak'),
      supabase.from('posts').select('user_id').eq('post_date', todayUTCDateString()),
    ]);
    const postedIds = new Set((postedToday ?? []).map((p) => p.user_id));
    const rows = (profiles ?? [])
      .filter((p) => p.id !== session?.user.id)
      .map((p) => ({
        id: p.id,
        name: p.username,
        color: p.avatar_color,
        streak: p.current_streak,
        posted: postedIds.has(p.id),
      }));
    setFriends(rows);
  }, [session?.user.id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Friends</Text>
      {friends === null ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : (
        <FlatList
          data={friends}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>👋</Text>
              <Text style={styles.emptyTitle}>No friends yet</Text>
              <Text style={styles.emptyBody}>Once others sign in, they show up here.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={[styles.avatar, { backgroundColor: item.color }]}>
                <Text style={styles.avatarLetter}>{item.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.nameCol}>
                <Text style={styles.name}>{item.name}</Text>
                {item.streak > 0 && <Text style={styles.streak}>🔥 {item.streak}-day streak</Text>}
              </View>
              <View style={[styles.badge, item.posted ? styles.badgePosted : styles.badgeWaiting]}>
                <Text style={styles.badgeText}>{item.posted ? 'Posted' : 'Waiting'}</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 60, paddingHorizontal: spacing.md },
  header: { fontSize: 28, fontFamily: fonts.extraBold, color: colors.ink, marginBottom: spacing.md },
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
    borderWidth: 2,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { color: colors.ink, fontWeight: '800', fontSize: 13 },
  nameCol: { flex: 1 },
  name: { fontFamily: fonts.bold, color: colors.ink },
  streak: { color: colors.inkMuted, fontSize: 12, marginTop: 1 },
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
  emptyTitle: { fontFamily: fonts.bold, fontSize: 17, color: colors.ink },
  emptyBody: { color: colors.inkMuted, textAlign: 'center' },
});
