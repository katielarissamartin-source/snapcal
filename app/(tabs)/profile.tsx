import { Pressable, StyleSheet, Text, View } from 'react-native';

// Shell only. "Blocked users" and "Report history" are placeholders for the
// minimal report/block UI, which is its own Month 1 task.
const SETTINGS_ROWS = ['Account', 'Blocked users', 'Report history', 'Sign out'];

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Profile</Text>
      {SETTINGS_ROWS.map((row) => (
        <Pressable key={row} style={styles.row}>
          <Text>{row}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 16 },
  header: { fontSize: 24, fontWeight: '600', marginBottom: 16 },
  row: { paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#ddd' },
});
