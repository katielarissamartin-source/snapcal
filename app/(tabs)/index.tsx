import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { captureRef } from 'react-native-view-shot';
import { Button } from '../../components/Button';
import { getTodaysPrompt, Prompt } from '../../lib/prompts';
import { useSession } from '../../lib/session';
import { supabase } from '../../lib/supabase';
import { blockShadow, card, colors, fonts, radius, spacing } from '../../lib/theme';

type Stage = 'live' | 'capturing' | 'review';

function todayUTCDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function CameraScreen() {
  const { session, profile, refreshProfile } = useSession();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [stage, setStage] = useState<Stage>('live');
  const [mainUri, setMainUri] = useState<string | null>(null);
  const [secondaryUri, setSecondaryUri] = useState<string | null>(null);
  const [mainLoaded, setMainLoaded] = useState(false);
  const [secondaryLoaded, setSecondaryLoaded] = useState(false);
  const [composedUri, setComposedUri] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<Prompt | null>(null);

  const cameraRef = useRef<CameraView>(null);
  const compositeRef = useRef<View>(null);

  useEffect(() => {
    getTodaysPrompt().then(setPrompt);
  }, []);

  const alreadyPostedToday = profile?.last_post_date === todayUTCDateString();

  useEffect(() => {
    if (stage === 'review' && mainLoaded && secondaryLoaded && !composedUri) {
      captureRef(compositeRef, { format: 'jpg', quality: 0.9, result: 'tmpfile' })
        .then(setComposedUri)
        .catch(() => setError('Could not put the photo together — try retaking it.'));
    }
  }, [stage, mainLoaded, secondaryLoaded, composedUri]);

  const resetToLive = () => {
    setStage('live');
    setMainUri(null);
    setSecondaryUri(null);
    setMainLoaded(false);
    setSecondaryLoaded(false);
    setComposedUri(null);
    setCaption('');
    setError(null);
    setFacing('back');
  };

  const capture = async () => {
    if (!cameraRef.current) return;
    setStage('capturing');
    setError(null);
    try {
      const first = await cameraRef.current.takePictureAsync({ quality: 0.6 });
      setFacing((f) => (f === 'back' ? 'front' : 'back'));
      // Give the camera a beat to switch lenses before the second shot.
      await new Promise((resolve) => setTimeout(resolve, 900));
      const second = await cameraRef.current.takePictureAsync({ quality: 0.6 });
      setMainUri(first.uri);
      setSecondaryUri(second.uri);
      setStage('review');
    } catch {
      setError('Could not take both photos — try again.');
      setStage('live');
    }
  };

  const post = async () => {
    if (!composedUri || !session?.user) return;
    setPosting(true);
    setError(null);
    try {
      const response = await fetch(composedUri);
      const blob = await response.blob();
      const path = `${session.user.id}/${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage.from('posts').upload(path, blob, {
        contentType: 'image/jpeg',
      });
      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase.from('posts').insert({
        user_id: session.user.id,
        prompt_id: prompt?.id ?? null,
        image_path: path,
        caption: caption.trim() || null,
      });
      if (insertError) throw insertError;

      await refreshProfile();
      resetToLive();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong posting that.');
    } finally {
      setPosting(false);
    }
  };

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

  if (alreadyPostedToday && stage === 'live') {
    return (
      <View style={styles.permissionContainer}>
        <View style={styles.permissionCard}>
          <Text style={styles.permissionEmoji}>🔥</Text>
          <Text style={styles.permissionTitle}>You're done for today</Text>
          <Text style={styles.permissionMessage}>
            {profile?.current_streak && profile.current_streak > 1
              ? `${profile.current_streak}-day streak. Come back tomorrow.`
              : 'Nice work. Come back tomorrow for the next prompt.'}
          </Text>
        </View>
      </View>
    );
  }

  if (stage === 'review') {
    return (
      <View style={styles.container}>
        <View style={styles.previewFrame}>
          <View ref={compositeRef} collapsable={false} style={styles.compositeFrame}>
            {mainUri && (
              <Image
                source={{ uri: mainUri }}
                style={styles.compositeMain}
                resizeMode="cover"
                onLoad={() => setMainLoaded(true)}
              />
            )}
            {secondaryUri && (
              <View style={styles.compositeThumbWrap}>
                <Image
                  source={{ uri: secondaryUri }}
                  style={styles.compositeThumb}
                  resizeMode="cover"
                  onLoad={() => setSecondaryLoaded(true)}
                />
              </View>
            )}
            {!composedUri && (
              <View style={styles.composingOverlay}>
                <ActivityIndicator color={colors.surface} />
              </View>
            )}
          </View>
        </View>
        <View style={styles.reviewControls}>
          <TextInput
            style={styles.captionInput}
            placeholder="Add a caption (optional)"
            placeholderTextColor={colors.inkMuted}
            value={caption}
            onChangeText={setCaption}
          />
          {error && <Text style={styles.error}>{error}</Text>}
          <View style={styles.reviewButtons}>
            <Button title="Retake" variant="ghost" onPress={resetToLive} style={styles.reviewButtonHalf} />
            {posting ? (
              <ActivityIndicator color={colors.primary} style={styles.reviewButtonHalf} />
            ) : (
              <Button
                title="Post"
                onPress={post}
                style={styles.reviewButtonHalf}
                variant={composedUri ? 'primary' : 'ghost'}
              />
            )}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {prompt && (
        <View style={styles.promptBanner}>
          <Text style={styles.promptLabel}>TODAY'S PROMPT</Text>
          <Text style={styles.promptText}>{prompt.text}</Text>
        </View>
      )}
      <View style={styles.previewFrame}>
        <CameraView ref={cameraRef} style={styles.camera} facing={facing} />
        {stage === 'capturing' && (
          <View style={styles.composingOverlay}>
            <ActivityIndicator color={colors.surface} />
          </View>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
      <View style={styles.controls}>
        <Pressable
          style={styles.flipButton}
          onPress={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))}
          disabled={stage === 'capturing'}
        >
          <Text style={styles.flipIcon}>🔄</Text>
        </Pressable>
        <Pressable style={styles.shutterOuter} onPress={capture} disabled={stage === 'capturing'}>
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
  permissionTitle: { fontSize: 24, fontFamily: fonts.extraBold, color: colors.ink },
  permissionMessage: { textAlign: 'center', color: colors.inkMuted, marginBottom: spacing.sm },
  promptBanner: {
    ...card,
    margin: spacing.md,
    marginBottom: 0,
    padding: spacing.md,
  },
  promptLabel: { fontSize: 11, fontFamily: fonts.bold, color: colors.primaryDark, letterSpacing: 1.2 },
  promptText: { fontSize: 18, fontFamily: fonts.bold, color: colors.ink, marginTop: 2 },
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
  composingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(31,42,68,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compositeFrame: { flex: 1, backgroundColor: colors.ink },
  compositeMain: { flex: 1, width: '100%', height: '100%' },
  compositeThumbWrap: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 96,
    height: 128,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.surface,
    overflow: 'hidden',
    ...blockShadow,
  },
  compositeThumb: { width: '100%', height: '100%' },
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
  reviewControls: { padding: spacing.md, gap: spacing.sm },
  captionInput: {
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    fontSize: 15,
    color: colors.ink,
    backgroundColor: colors.surface,
  },
  reviewButtons: { flexDirection: 'row', gap: spacing.sm },
  reviewButtonHalf: { flex: 1 },
  error: { color: colors.danger, textAlign: 'center', marginHorizontal: spacing.md },
});
