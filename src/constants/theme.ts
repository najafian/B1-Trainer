/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#12161C',
    background: '#FFFFFF',
    backgroundElement: '#F4F5F7',
    backgroundSelected: '#E4E6EB',
    textSecondary: '#5A616B',
    border: '#DDE0E5',
    /** Writing tasks sit on paper, per the design language. */
    paper: '#F7F0E1',
    paperText: '#1A1712',
  },
  dark: {
    text: '#F2F4F7',
    background: '#0D0F12',
    backgroundElement: '#1A1D22',
    backgroundSelected: '#272B32',
    textSecondary: '#A8AEB8',
    border: '#2C3037',
    paper: '#1B1810',
    paperText: '#F0EADC',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

/**
 * Type system. Custom font files do not respond to fontWeight, so each weight
 * is its own family - picking the wrong one silently falls back to the system
 * face. Display is the Jugendstil-flavoured serif for station names, body is
 * the grotesk for everything else.
 */
export const AppFonts = {
  display: 'LibreBodoni_700Bold',
  displayMedium: 'LibreBodoni_500Medium',
  body: 'PublicSans_400Regular',
  bodyMedium: 'PublicSans_500Medium',
  bodySemiBold: 'PublicSans_600SemiBold',
  bodyBold: 'PublicSans_700Bold',
} as const;

export const Radius = { small: 8, medium: 12, large: 16, pill: 999 } as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
