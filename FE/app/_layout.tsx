import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { router, Stack, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

import { MedsTheme } from '@/constants/meds-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getDefaultRouteByRole, useAuth, AuthProvider } from '@/store/auth-store';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutContent />
    </AuthProvider>
  );
}

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: MedsTheme.colors.ink,
    background: MedsTheme.colors.canvas,
    card: MedsTheme.colors.canvas,
    text: MedsTheme.colors.ink,
    border: MedsTheme.colors.hairlineStrong,
  },
};

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const { status, role, portal } = useAuth();
  const segments = useSegments();
  const [fontsLoaded] = useFonts({
    Inter_400Regular: require('@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf'),
    Inter_500Medium: require('@expo-google-fonts/inter/500Medium/Inter_500Medium.ttf'),
    Inter_600SemiBold: require('@expo-google-fonts/inter/600SemiBold/Inter_600SemiBold.ttf'),
  });
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    const firstSegment = segments[0];
    const isPublicRoute = firstSegment === 'login' || firstSegment === 'register';
    const isPatientTabsRoute = firstSegment === '(tabs)';
    const isCaregiverRoute = firstSegment === 'caregiver';
    const isAdminRoute = firstSegment === 'admin';

    if (status === 'guest' && !isPublicRoute) {
      router.replace('/login');
      return;
    }

    if (status !== 'authenticated') {
      return;
    }

    if (isPublicRoute) {
      router.replace(getDefaultRouteByRole(role, portal));
      return;
    }

    if (role === 'caregiver' && isPatientTabsRoute) {
      router.replace('/caregiver/dashboard');
      return;
    }

    if (role === 'admin' && isPatientTabsRoute) {
      router.replace('/admin');
      return;
    }

    if (role === 'patient' && (isCaregiverRoute || isAdminRoute)) {
      router.replace('/');
    }
  }, [status, role, portal, segments]);

  if (!fontsLoaded || status === 'loading') {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={MedsTheme.colors.ink} />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : navigationTheme}>
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: MedsTheme.colors.canvas },
          headerStyle: { backgroundColor: MedsTheme.colors.canvas },
          headerTintColor: MedsTheme.colors.ink,
          headerShadowVisible: false,
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="profile-health" options={{ title: 'Hồ sơ sức khỏe', headerShadowVisible: false }} />
        <Stack.Screen name="medicines/new" options={{ title: 'Thêm lịch uống thuốc', headerShadowVisible: false }} />
        <Stack.Screen name="medicines/[id]/edit" options={{ title: 'Chỉnh sửa thuốc', headerShadowVisible: false }} />
        <Stack.Screen name="reminder" options={{ title: 'Nhắc uống thuốc', headerShadowVisible: false }} />
        <Stack.Screen name="missed-alert" options={{ title: 'Cảnh báo quên thuốc', headerShadowVisible: false }} />
        <Stack.Screen name="caregivers" options={{ title: 'Người thân theo dõi', headerShadowVisible: false }} />
        <Stack.Screen
          name="caregiver/dashboard"
          options={{
            title: 'Dashboard người thân',
            headerShadowVisible: false,
            headerBackVisible: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="caregiver/patient/[id]/index"
          options={{ title: 'Quản lý bệnh nhân', headerShadowVisible: false }}
        />
        <Stack.Screen
          name="caregiver/patient/[id]/prescriptions"
          options={{ title: 'Đơn thuốc', headerShadowVisible: false }}
        />
        <Stack.Screen
          name="caregiver/patient/[id]/schedule"
          options={{ title: 'Lịch uống thuốc', headerShadowVisible: false }}
        />
        <Stack.Screen
          name="caregiver/patient/[id]/schedule/[scheduleId]"
          options={{ title: 'Chi tiết lịch uống', headerShadowVisible: false }}
        />
        <Stack.Screen name="appointments/index" options={{ title: 'Lịch tái khám', headerShadowVisible: false }} />
        <Stack.Screen name="appointments/new" options={{ title: 'Thêm lịch khám', headerShadowVisible: false }} />
        <Stack.Screen name="appointments/[id]/edit" options={{ title: 'Sửa lịch khám', headerShadowVisible: false }} />
        <Stack.Screen name="reports" options={{ title: 'Báo cáo tuân thủ', headerShadowVisible: false }} />
        <Stack.Screen
          name="settings/notifications"
          options={{ title: 'Cài đặt thông báo', headerShadowVisible: false }}
        />
        <Stack.Screen name="ai-assistant" options={{ title: 'Hỏi AI', headerShadowVisible: false }} />
        <Stack.Screen name="admin" options={{ title: 'Admin', headerShadowVisible: false }} />
        <Stack.Screen
          name="add-medication"
          options={{
            title: 'Thêm thuốc mới',
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="medication/[id]"
          options={{
            title: 'Chi tiết thuốc',
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="sos"
          options={{
            title: 'Emergency Help',
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MedsTheme.colors.canvas,
  },
});
