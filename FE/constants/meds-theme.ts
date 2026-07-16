import { Platform } from 'react-native';

/** Design tokens from DESIGN.md — Expo-inspired editorial system */
export const MedsTheme = {
  colors: {
    // Brand & accent
    primary: '#000000',
    primaryActive: '#1a1a1a',
    textLink: '#0d74ce',
    textLinkSecondary: '#476cff',
    accentLinkBright: '#47c2ff',
    accentWarning: '#ab6400',
    accentPreview: '#8145b5',

    // Surfaces
    canvas: '#ffffff',
    canvasSoft: '#fafafa',
    surfaceCard: '#ffffff',
    surfaceStrong: '#f0f0f3',
    surfaceDark: '#171717',
    surfaceDarkElevated: '#1a1a1a',

    // Atmospheric (hero / splash only)
    gradientSkyLight: '#cfe7ff',
    gradientSkyMid: '#a8c8e8',

    // Hairlines
    hairline: '#f0f0f3',
    hairlineSoft: '#f5f5f7',
    hairlineStrong: '#dcdee0',

    // Text
    ink: '#171717',
    body: '#60646c',
    bodyStrong: '#171717',
    muted: '#999999',
    mutedSoft: '#cccccc',
    onPrimary: '#ffffff',
    onDark: '#ffffff',
    onDarkSoft: '#b0b4ba',

    // Semantic
    semanticSuccess: '#16a34a',
    semanticError: '#eb8e90',
    critical: '#C63535',

    // Brand identity — logo, name, slogan (unchanged from brand image)
    brandName: '#1B3D6E',
    brandNameLight: '#2A5289',
    brandNameSoft: '#E8F1FA',
    brandSlogan: '#76839A',

    // Legacy aliases (used across screens)
    appBackground: '#ffffff',
    pageBackground: '#fafafa',
    card: '#ffffff',
    primaryDark: '#171717',
    primarySoft: '#f0f0f3',
    textMain: '#171717',
    textMuted: '#60646c',
    border: '#dcdee0',
    success: '#16a34a',
    warning: '#ab6400',
    danger: '#C63535',
    dangerSoft: '#FDEBEC',
    shadow: 'rgba(0, 0, 0, 0.04)',
  },

  fonts: {
    sans: 'Inter_400Regular',
    sansMedium: 'Inter_500Medium',
    sansSemiBold: 'Inter_600SemiBold',
    mono: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }) as string,
    /** System fallback when custom fonts are loading */
    fallback: Platform.select({
      ios: 'System',
      android: 'sans-serif',
      default: 'System',
    }) as string,
  },

  typography: {
    displayMega: { fontSize: 32, fontWeight: '600' as const, lineHeight: 34, letterSpacing: -0.96 },
    displayLg: { fontSize: 28, fontWeight: '600' as const, lineHeight: 32, letterSpacing: -0.84 },
    displayMd: { fontSize: 22, fontWeight: '600' as const, lineHeight: 27, letterSpacing: -0.5 },
    titleMd: { fontSize: 18, fontWeight: '600' as const, lineHeight: 25 },
    titleSm: { fontSize: 16, fontWeight: '600' as const, lineHeight: 22 },
    bodyMd: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
    bodySm: { fontSize: 14, fontWeight: '400' as const, lineHeight: 21 },
    caption: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
    captionUppercase: { fontSize: 11, fontWeight: '600' as const, lineHeight: 15, letterSpacing: 0.88 },
    button: { fontSize: 14, fontWeight: '500' as const, lineHeight: 14 },
    navLink: { fontSize: 14, fontWeight: '500' as const, lineHeight: 20 },
    code: { fontSize: 13, fontWeight: '400' as const, lineHeight: 20 },
  },

  spacing: {
    xxs: 4,
    xs: 8,
    sm: 12,
    base: 16,
    md: 20,
    lg: 24,
    xl: 32,
    xxl: 48,
    section: 96,
  },

  radius: {
    none: 0,
    xs: 4,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    pill: 9999,
  },

  elevation: {
    card: {
      shadowColor: '#000000',
      shadowOpacity: 0.04,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
    float: {
      shadowColor: '#1B3D6E',
      shadowOpacity: 0.14,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
      elevation: 8,
    },
    hero: {
      shadowColor: '#0C2444',
      shadowOpacity: 0.32,
      shadowRadius: 28,
      shadowOffset: { width: 0, height: 16 },
      elevation: 14,
    },
    dock: {
      shadowColor: '#1B3D6E',
      shadowOpacity: 0.2,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 12 },
      elevation: 18,
    },
  },
};

export type MedsThemeColors = typeof MedsTheme.colors;
