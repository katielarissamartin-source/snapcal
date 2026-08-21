import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Button } from '../../components/Button';
import { blockShadow, card, colors, radius, spacing } from '../../lib/theme';

// Shell for the capture flow. Composite (sequential back+front) capture is a
// separate Month 1 task — this screen just gets a live preview + permission
// handling working so that flow has somewhere to plug in.
export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <View style={styles.permissionCard}>
          <Text style={styles.permissionEmoji}>📸</Text>
          <Text style={styles.permissionTitle}>Smile!</Text>
          <Text style={styles.permissionMessage}>Snapcal needs your camera to take today's photo.</Text>
          <Button title="Grant camera permission" onPress={requestPermission} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.previewFrame}>
        <CameraView ref={cameraRef} style={styles.camera} facing={facing} />
      </View>
      <View style={styles.controls}>
        <Pressable style={styles.flipButton} onPress={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))}>
          <Text style={styles.flipIcon}>🔄</Text>
        </Pressable>
        <Pressable style={styles.shutterOuter} onPress={() => {}}>
          <View style={styles.shutterInner} />
        </Pressable>
        <View style={styles.flipButtonSpacer} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'space-between' },
  permissionContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  permissionCard: {
    ...card,
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
    width: '100%',
  },
  permissionEmoji: { fontSize: 40 },
  permissionTitle: { fontSize: 22, fontWeight: '800', color: colors.ink },
  permissionMessage: { textAlign: 'center', color: colors.inkMuted, marginBottom: spacing.sm },
  previewFrame: {
    flex: 1,
    margin: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.ink,
    overflow: 'hidden',
    ...blockShadow,
  },
  camera: { flex: 1 },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  flipButton: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    ...blockShadow,
  },
  flipButtonSpacer: { width: 48 },
  flipIcon: { fontSize: 20 },
  shutterOuter: {
    width: 76,
    height: 76,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 3,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    ...blockShadow,
  },
  shutterInner: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.ink,
  },
});
