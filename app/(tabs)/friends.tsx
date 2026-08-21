import { FlatList, StyleSheet, Text, View } from 'react-native';

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
        ListEmptyComponent={<Text style={styles.empty}>No friends added yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text>{item.name}</Text>
            <Text style={styles.status}>{item.status === 'posted' ? 'Posted today' : 'No post yet'}</Text>
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
  },
  status: { color: '#888' },
});
