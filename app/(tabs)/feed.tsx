import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { ActivityIndicator, FlatList, Image, Modal, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { blockUser, reportPost } from '../../lib/moderation';
import { useSession } from '../../lib/session';
import { supabase } from '../../lib/supabase';
import { card, colors, fonts, radius, spacing } from '../../lib/theme';

type Post = {
  id: string;
  user_id: string;
  caption: string | null;
  created_at: string;
  image_path: string;
  profiles: { username: string; avatar_color: string } | null;
  prompts: { text: string } | null;
};

const REPORT_REASONS = ['Inappropriate', 'Spam', 'Other'];

export default function FeedScreen() {
  const { session } = useSession();
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [actionsPost, setActionsPost] = useState<Post | null>(null);
  const [reportingPost, setReportingPost] = useState<Post | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('posts')
      .select('id, user_id, caption, created_at, image_path, profiles(username, avatar_color), prompts(text)')
      .order('created_at', { ascending: false })
      .limit(30)
      .returns<Post[]>();
    setPosts(data ?? []);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const submitReport = async (reason: string) => {
    if (!reportingPost || !session?.user) return;
    setBusy(true);
    try {
      await reportPost(reportingPost.id, session.user.id, reason);
      await load();
    } finally {
      setBusy(false);
      setReportingPost(null);
      setActionsPost(null);
    }
  };

  const submitBlock = async () => {
    if (!actionsPost || !session?.user) return;
    setBusy(true);
    try {
      await blockUser(session.user.id, actionsPost.user_id);
      await load();
    } finally {
      setBusy(false);
      setActionsPost(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Feed</Text>
      {posts === null ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>🎬</Text>
              <Text style={styles.emptyTitle}>Nothing yet today</Text>
              <Text style={styles.emptyBody}>Be the first to post and kick things off.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const imageUrl = supabase.storage.from('posts').getPublicUrl(item.image_path).data.publicUrl;
            const isOwn = item.user_id === session?.user.id;
            return (
              <View style={styles.post}>
                <Image source={{ uri: imageUrl }} style={styles.postImage} resizeMode="cover" />
                <View style={styles.postBody}>
                  <View style={styles.postHeader}>
                    <View style={[styles.avatar, { backgroundColor: item.profiles?.avatar_color ?? colors.secondary }]}>
                      <Text style={styles.avatarLetter}>{(item.profiles?.username ?? '?').charAt(0).toUpperCase()}</Text>
                    </View>
                    <Text style={styles.author}>{item.profiles?.username ?? 'someone'}</Text>
                    {!isOwn && (
                      <Pressable style={styles.moreButton} onPress={() => setActionsPost(item)}>
                        <Text style={styles.moreIcon}>•••</Text>
                      </Pressable>
                    )}
                  </View>
                  {item.prompts?.text && <Text style={styles.promptTag}>{item.prompts.text}</Text>}
                  {item.caption && <Text style={styles.caption}>{item.caption}</Text>}
                </View>
              </View>
            );
          }}
        />
      )}

      <Modal visible={!!actionsPost} transparent animationType="fade" onRequestClose={() => setActionsPost(null)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setActionsPost(null)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{actionsPost?.profiles?.username}</Text>
            <Pressable style={styles.sheetRow} onPress={() => setReportingPost(actionsPost)}>
              <Text style={styles.sheetRowText}>🚩 Report this post</Text>
            </Pressable>
            <Pressable style={styles.sheetRow} onPress={submitBlock} disabled={busy}>
              <Text style={[styles.sheetRowText, styles.sheetRowDanger]}>🚫 Block {actionsPost?.profiles?.username}</Text>
            </Pressable>
            <Pressable style={styles.sheetRow} onPress={() => setActionsPost(null)}>
              <Text style={styles.sheetRowText}>Cancel</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <Modal visible={!!reportingPost} transparent animationType="fade" onRequestClose={() => setReportingPost(null)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setReportingPost(null)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Why are you reporting this?</Text>
            {REPORT_REASONS.map((reason) => (
              <Pressable key={reason} style={styles.sheetRow} onPress={() => submitReport(reason)} disabled={busy}>
                <Text style={styles.sheetRowText}>{reason}</Text>
              </Pressable>
            ))}
            <Pressable style={styles.sheetRow} onPress={() => setReportingPost(null)}>
              <Text style={styles.sheetRowText}>Cancel</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 60, paddingHorizontal: spacing.md },
  header: { fontSize: 28, fontFamily: fonts.extraBold, color: colors.ink, marginBottom: spacing.md },
  list: { gap: spacing.md, paddingBottom: spacing.xl },
  post: { ...card, overflow: 'hidden' },
  postImage: { width: '100%', aspectRatio: 3 / 4, backgroundColor: colors.ink },
  postBody: { padding: spacing.md, gap: 4 },
  postHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { color: colors.ink, fontWeight: '800', fontSize: 12 },
  author: { fontFamily: fonts.bold, color: colors.ink, flex: 1 },
  moreButton: { paddingHorizontal: spacing.xs, paddingVertical: 2 },
  moreIcon: { color: colors.inkMuted, fontWeight: '800', letterSpacing: 1 },
  promptTag: { color: colors.inkMuted, fontSize: 12, fontWeight: '700' },
  caption: { color: colors.ink },
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(31,42,68,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    ...card,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 0,
    margin: spacing.md,
    marginBottom: 0,
    padding: spacing.md,
    gap: 4,
  },
  sheetTitle: { fontFamily: fonts.bold, color: colors.inkMuted, fontSize: 13, marginBottom: spacing.xs, textAlign: 'center' },
  sheetRow: { paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#EEE' },
  sheetRowText: { textAlign: 'center', fontFamily: fonts.bold, color: colors.ink, fontSize: 15 },
  sheetRowDanger: { color: colors.danger },
});
