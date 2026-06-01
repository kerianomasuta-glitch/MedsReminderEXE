import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ title: 'Đăng nhập', headerShadowVisible: false }} />
        <Stack.Screen name="register" options={{ title: 'Đăng ký', headerShadowVisible: false }} />
        <Stack.Screen name="forgot-password" options={{ title: 'Quên mật khẩu', headerShadowVisible: false }} />
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
