import { useRef, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

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
      <View style={styles.container}>
        <Text style={styles.message}>Snapcal needs camera access to take your daily photo.</Text>
        <Button onPress={requestPermission} title="Grant camera permission" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing} />
      <View style={styles.controls}>
        <Button title="Flip" onPress={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))} />
        <Button title="Capture" onPress={() => {}} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center' },
  message: { color: '#fff', textAlign: 'center', margin: 24 },
  camera: { flex: 1 },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    backgroundColor: '#000',
  },
});
