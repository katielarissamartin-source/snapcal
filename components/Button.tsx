import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { blockShadow, colors, radius, spacing } from '../lib/theme';

type Props = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  style?: ViewStyle;
};

export function Button({ title, onPress, variant = 'primary', style }: Props) {
  const background =
    variant === 'primary' ? colors.primary : variant === 'secondary' ? colors.secondary : colors.surface;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: background, transform: [{ translateY: pressed ? 2 : 0 }] },
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text style={styles.label}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.ink,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...blockShadow,
  },
  pressed: {
    shadowOffset: { width: 0, height: 0 },
  },
  label: {
    color: colors.ink,
    fontWeight: '800',
    fontSize: 15,
  },
});
