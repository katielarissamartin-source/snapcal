import { useCallback, useState } from 'react';
import { router } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { unblockUser } from '../lib/moderation';
import { useSession } from '../lib/session';
import { supabase } from '../lib/supabase';
import { card, colors, fonts, radius, spacing } from '../lib/theme';

type BlockedRow = { id: string; username: string; avatar_color: string };

export default function BlockedUsersScreen() {
  const { session } = useSession();
  const [rows, setRows] = useState<BlockedRow[] | null>(null);

  const load = useCallback(async () => {
    if (!session?.user) return;
    const { data } = await supabase
      .from('blocks')
      .select('blocked_id, profiles!blocks_blocked_id_fkey(username, avatar_color)')
      .eq('blocker_id', session.user.id)
      .returns<{ blocked_id: string; profiles: { username: string; avatar_color: string } | null }[]>();
    setRows((data ?? []).map((r) => ({ id: r.blocked_id, username: r.profiles?.username ?? 'unknown', avatar_color: r.profiles?.avatar_color ?? colors.secondary })));
  }, [session?.user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const unblock = async (id: string) => {
    if (!session?.user) return;
    await unblockUser(session.user.id, id);
    await load();
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>
      </View>
      <Text style={styles.header}>Blocked users</Text>
      {rows === null ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>✌️</Text>
              <Text style={styles.emptyTitle}>Nobody blocked</Text>
              <Text style={styles.emptyBody}>Users you block from the Feed show up here.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={[styles.avatar, { backgroundColor: item.avatar_color }]}>
                <Text style={styles.avatarLetter}>{item.username.charAt(0).toUpperCase()}</Text>
              </View>
              <Text style={styles.name}>{item.username}</Text>
              <Button title="Unblock" variant="ghost" onPress={() => unblock(item.id)} />
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 60, paddingHorizontal: spacing.md },
  headerRow: { marginBottom: spacing.sm },
  back: { color: colors.inkMuted, fontFamily: fonts.bold, fontSize: 15 },
  header: { fontSize: 28, fontFamily: fonts.extraBold, color: colors.ink, marginBottom: spacing.md },
  list: { gap: spacing.sm, paddingBottom: spacing.xl },
  row: { ...card, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md },
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
  name: { flex: 1, fontFamily: fonts.bold, color: colors.ink },
  emptyCard: { ...card, alignItems: 'center', padding: spacing.xl, marginTop: spacing.xl, gap: 4 },
  emptyEmoji: { fontSize: 32, marginBottom: spacing.xs },
  emptyTitle: { fontFamily: fonts.bold, fontSize: 17, color: colors.ink },
  emptyBody: { color: colors.inkMuted, textAlign: 'center' },
});
