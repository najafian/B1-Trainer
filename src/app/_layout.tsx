import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';

/**
 * Root navigator. The tab bar lives in the (tabs) group, so station and skill
 * screens push on top of it as ordinary stack screens with a back button
 * instead of being swallowed by the tab slot.
 */
export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="station/[n]/index" options={{ title: 'Station' }} />
        <Stack.Screen name="station/[n]/lesen" options={{ title: 'Lesen' }} />
        <Stack.Screen name="station/[n]/schreiben" options={{ title: 'Schreiben' }} />
      </Stack>
    </ThemeProvider>
  );
}
