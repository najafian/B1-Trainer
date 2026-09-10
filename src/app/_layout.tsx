import {
  LibreBodoni_500Medium,
  LibreBodoni_700Bold,
} from '@expo-google-fonts/libre-bodoni';
import {
  PublicSans_400Regular,
  PublicSans_500Medium,
  PublicSans_600SemiBold,
  PublicSans_700Bold,
} from '@expo-google-fonts/public-sans';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

SplashScreen.preventAutoHideAsync();

/**
 * Root navigator. The tab bar lives in the (tabs) group, so station and skill
 * screens push on top of it as ordinary stack screens with a back button
 * instead of being swallowed by the tab slot.
 */
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded, fontError] = useFonts({
    LibreBodoni_500Medium,
    LibreBodoni_700Bold,
    PublicSans_400Regular,
    PublicSans_500Medium,
    PublicSans_600SemiBold,
    PublicSans_700Bold,
  });

  useEffect(() => {
    // Render once the faces are ready, but never hang on a font failure.
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

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
