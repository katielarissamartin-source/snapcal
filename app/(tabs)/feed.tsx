import { FlatList, StyleSheet, Text, View } from 'react-native';

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
        ListEmptyComponent={<Text style={styles.empty}>No posts yet — be the first today.</Text>}
        renderItem={({ item }) => (
          <View style={styles.post}>
            <Text style={styles.author}>{item.author}</Text>
            <Text>{item.caption}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 16 },
  header: { fontSize: 24, fontWeight: '600', marginBottom: 16 },
  empty: { color: '#888', marginTop: 40, textAlign: 'center' },
  post: { paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#ddd' },
  author: { fontWeight: '600' },
});
