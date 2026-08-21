// A restrained take on the chunky, colorful "toy block" look — bold
// outlines and one accent per surface, not a color on every element.
export const colors = {
  background: '#EAF6FF',
  surface: '#FFFFFF',
  primary: '#FF6B4A',
  primaryDark: '#E14F30',
  secondary: '#2FC6D6',
  accent: '#FFC93C',
  ink: '#1F2A44',
  inkMuted: '#6B7A99',
  danger: '#FF4D6D',
};

// Baloo 2 is the app's one deliberate "brand" flourish — used sparingly, on
// headers, buttons, and labels, never on running body copy.
export const fonts = {
  bold: 'Baloo2_700Bold',
  extraBold: 'Baloo2_800ExtraBold',
};

export const radius = { sm: 10, md: 16, lg: 22, pill: 999 };

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };

// A hard, unblurred offset — reads as a pressable "block" rather than a
// soft drop shadow, and stays consistent between iOS and Android.
export const blockShadow = {
  shadowColor: colors.ink,
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: 3,
};

export const card = {
  backgroundColor: colors.surface,
  borderRadius: radius.lg,
  borderWidth: 2,
  borderColor: colors.ink,
  ...blockShadow,
};
