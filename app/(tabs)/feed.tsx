import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { ActivityIndicator, FlatList, Image, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSession } from '../../lib/session';
import { supabase } from '../../lib/supabase';
import { card, colors, fonts, radius, spacing } from '../../lib/theme';

type Post = {
  id: string;
  caption: string | null;
  created_at: string;
  image_path: string;
  profiles: { username: string; avatar_color: string } | null;
  prompts: { text: string } | null;
};

export default function FeedScreen() {
  useSession();
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('posts')
      .select('id, caption, created_at, image_path, profiles(username, avatar_color), prompts(text)')
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
            return (
              <View style={styles.post}>
                <Image source={{ uri: imageUrl }} style={styles.postImage} resizeMode="cover" />
                <View style={styles.postBody}>
                  <View style={styles.postHeader}>
                    <View style={[styles.avatar, { backgroundColor: item.profiles?.avatar_color ?? colors.secondary }]}>
                      <Text style={styles.avatarLetter}>{(item.profiles?.username ?? '?').charAt(0).toUpperCase()}</Text>
                    </View>
                    <Text style={styles.author}>{item.profiles?.username ?? 'someone'}</Text>
                  </View>
                  {item.prompts?.text && <Text style={styles.promptTag}>{item.prompts.text}</Text>}
                  {item.caption && <Text style={styles.caption}>{item.caption}</Text>}
                </View>
              </View>
            );
          }}
        />
      )}
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
  author: { fontFamily: fonts.bold, color: colors.ink },
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
});
