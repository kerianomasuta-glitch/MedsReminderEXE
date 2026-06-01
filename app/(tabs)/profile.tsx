import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandHeader } from '@/components/meds/ui-kit';
import { MedsTheme } from '@/constants/meds-theme';

const menuItems = [
  { label: 'Hồ sơ sức khỏe', icon: 'person-outline', route: '/profile-health', danger: false },
  { label: 'Quản lý lịch uống', icon: 'calendar-outline', route: '/schedule', danger: false },
  { label: 'Người thân theo dõi', icon: 'people-outline', route: '/caregivers', danger: false },
  { label: 'Lịch tái khám', icon: 'medkit-outline', route: '/appointments/index', danger: false },
  { label: 'Báo cáo tuân thủ', icon: 'stats-chart-outline', route: '/reports', danger: false },
  { label: 'Cài đặt thông báo', icon: 'notifications-outline', route: '/settings/notifications', danger: false },
  { label: 'Hỏi AI', icon: 'sparkles-outline', route: '/ai-assistant', danger: false },
  { label: 'Đăng xuất', icon: 'log-out-outline', route: '/login', danger: true },
] as const;

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topCard}>
          <BrandHeader slogan="Nhắc lịch uống thuốc mỗi ngày" />
        </View>

        {menuItems.map((item) => (
          <Pressable
            key={item.label}
            style={({ pressed, hovered }) => [styles.rowButton, (pressed || hovered) && styles.rowButtonActive]}
            onPress={() => {
              if (item.route === '/login') {
                router.replace('/login');
                return;
              }
              router.push(item.route);
            }}>
            <Ionicons
              name={item.icon}
              size={18}
              color={item.danger ? MedsTheme.colors.danger : MedsTheme.colors.primaryDark}
            />
            <Text style={[styles.rowButtonText, item.danger && styles.dangerText]}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={MedsTheme.colors.textMuted} />
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: MedsTheme.colors.appBackground,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 40,
    gap: 10,
  },
  topCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: MedsTheme.colors.border,
    backgroundColor: MedsTheme.colors.card,
    paddingVertical: 12,
    marginBottom: 4,
  },
  rowButton: {
    minHeight: 54,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MedsTheme.colors.border,
    backgroundColor: MedsTheme.colors.card,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowButtonActive: {
    opacity: 0.9,
  },
  rowButtonText: {
    flex: 1,
    color: MedsTheme.colors.textMain,
    fontWeight: '600',
    fontSize: 15,
  },
  dangerText: {
    color: MedsTheme.colors.danger,
  },
});
