import { FlatList, StyleSheet, Text, View } from 'react-native';
import { card, colors, radius, spacing } from '../../lib/theme';

type Post = { id: string; author: string; caption: string };

// Shell only — will read from Supabase `posts` once the backend is set up.
const PLACEHOLDER_POSTS: Post[] = [];

export default function FeedScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Feed</Text>
      <FlatList
        data={PLACEHOLDER_POSTS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🎬</Text>
            <Text style={styles.emptyTitle}>Nothing yet today</Text>
            <Text style={styles.emptyBody}>Be the first to post and kick things off.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.post}>
            <View style={styles.avatar}>
              <Text style={styles.avatarLetter}>{item.author.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.postBody}>
              <Text style={styles.author}>{item.author}</Text>
              <Text style={styles.caption}>{item.caption}</Text>
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
  post: {
    ...card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.secondary,
    borderWidth: 2,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { color: colors.ink, fontWeight: '800' },
  postBody: { flex: 1 },
  author: { fontWeight: '800', color: colors.ink },
  caption: { color: colors.inkMuted },
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
