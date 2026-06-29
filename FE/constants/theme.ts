/**
 * Navigation theme colors aligned with DESIGN.md tokens.
 */

import { Platform } from 'react-native';

import { MedsTheme } from '@/constants/meds-theme';

const tintColorLight = MedsTheme.colors.ink;
const tintColorDark = MedsTheme.colors.onDark;

export const Colors = {
  light: {
    text: MedsTheme.colors.ink,
    background: MedsTheme.colors.canvas,
    tint: tintColorLight,
    icon: MedsTheme.colors.body,
    tabIconDefault: MedsTheme.colors.muted,
    tabIconSelected: MedsTheme.colors.ink,
  },
  dark: {
    text: MedsTheme.colors.onDark,
    background: MedsTheme.colors.surfaceDark,
    tint: tintColorDark,
    icon: MedsTheme.colors.onDarkSoft,
    tabIconDefault: MedsTheme.colors.onDarkSoft,
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'Inter_400Regular',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'Menlo',
  },
  default: {
    sans: 'Inter_400Regular',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', SFMono-Regular, Menlo, monospace",
  },
});
