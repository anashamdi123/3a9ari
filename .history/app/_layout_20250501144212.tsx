import { useEffect } from 'react';
import { I18nManager, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  Tajawal_400Regular,
  Tajawal_500Medium,
  Tajawal_700Bold
} from '@expo-google-fonts/tajawal';
import { AuthProvider } from '@/context/auth-context';

// Force RTL for Arabic language
if (Platform.OS === 'web' && !I18nManager.isRTL) {
  I18nManager.forceRTL(true);
  I18nManager.allowRTL(true);
}

// Keep splash screen visible while loading fonts
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Tajawal-Regular': Tajawal_400Regular,
    'Tajawal-Medium': Tajawal_500Medium,
    'Tajawal-Bold': Tajawal_700Bold,
  });

  // Hide splash screen once fonts are loaded
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Return null to wait for fonts
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AuthProvider>
      <Stack 
        screenOptions={{ 
          headerShown: false,
          headerTitleAlign: 'right',
          headerTitleStyle: {
            fontFamily: 'Tajawal-Bold',
            fontSize: 18,
          },
          headerBackTitleVisible: false,
          headerBackVisible: true,
          headerBackButtonMenuEnabled: false,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="property/[id]" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="auth/login" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="auth/register" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen 
          name="+not-found" 
          options={{ 
            title: 'صفحة غير موجودة',
            headerShown: true,
          }} 
        />
      </Stack>
      <StatusBar style="auto" />
    </AuthProvider>
  );
}