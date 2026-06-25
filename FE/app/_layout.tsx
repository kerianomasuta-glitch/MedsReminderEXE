import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { router, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { getDefaultRouteByRole, useAuth, AuthProvider } from '@/store/auth-store';

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

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const { status, role, portal } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    const firstSegment = segments[0];
    const secondSegment = segments[1];
    const isPublicRoute = firstSegment === 'login' || firstSegment === 'register';
    const isChooseRoleRoute = firstSegment === 'choose-role';
    const isCaregiverOnboardingRoute = firstSegment === 'caregiver' && secondSegment === 'create-patient';

    if (status === 'guest' && !isPublicRoute) {
      router.replace('/login');
      return;
    }

    if (status === 'authenticated' && role === 'caregiver' && !portal && !isChooseRoleRoute && !isCaregiverOnboardingRoute) {
      router.replace('/choose-role');
      return;
    }

    if (status === 'authenticated' && (isPublicRoute || isChooseRoleRoute)) {
      router.replace(getDefaultRouteByRole(role, portal));
    }
  }, [status, role, portal, segments]);

  if (status === 'loading') {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ title: 'Đăng nhập', headerShadowVisible: false }} />
        <Stack.Screen name="register" options={{ title: 'Đăng ký', headerShadowVisible: false }} />
        <Stack.Screen name="choose-role" options={{ title: 'Chọn vai trò', headerShadowVisible: false }} />
        <Stack.Screen name="profile-health" options={{ title: 'Hồ sơ sức khỏe', headerShadowVisible: false }} />
        <Stack.Screen name="medicines/new" options={{ title: 'Thêm thuốc mới', headerShadowVisible: false }} />
        <Stack.Screen name="medicines/[id]/edit" options={{ title: 'Chỉnh sửa thuốc', headerShadowVisible: false }} />
        <Stack.Screen name="reminder" options={{ title: 'Nhắc uống thuốc', headerShadowVisible: false }} />
        <Stack.Screen name="missed-alert" options={{ title: 'Cảnh báo quên thuốc', headerShadowVisible: false }} />
        <Stack.Screen name="caregivers" options={{ title: 'Người thân theo dõi', headerShadowVisible: false }} />
        <Stack.Screen
          name="caregiver/dashboard"
          options={{ title: 'Dashboard người thân', headerShadowVisible: false }}
        />
        <Stack.Screen
          name="caregiver/create-patient"
          options={{ title: 'Tạo bệnh nhân', headerShadowVisible: false }}
        />
        <Stack.Screen name="appointments" options={{ title: 'Lịch tái khám', headerShadowVisible: false }} />
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
  },
});
