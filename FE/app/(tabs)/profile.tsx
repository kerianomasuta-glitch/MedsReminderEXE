import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandHeader } from '@/components/meds/ui-kit';
import { profileMenuItems } from '@/constants/app-mock';
import { MedsTheme } from '@/constants/meds-theme';
import { useAuth } from '@/store/auth-store';

const { colors, typography, radius, spacing, fonts } = MedsTheme;

export default function ProfileScreen() {
  const { logout } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topCard}>
          <BrandHeader slogan="Nhắc lịch uống thuốc mỗi ngày" />
        </View>

        {profileMenuItems.map((item) => (
          <Pressable
            key={item.label}
            style={({ pressed }) => [styles.rowButton, pressed && styles.rowButtonActive]}
            onPress={() => {
              if (item.route === '/login') {
                void logout();
                return;
              }
              router.push(item.route);
            }}>
            <Ionicons
              name={item.icon}
              size={18}
              color={item.danger ? colors.critical : colors.ink}
            />
            <Text style={[styles.rowButtonText, item.danger && styles.dangerText]}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
    paddingBottom: 40,
    gap: 10,
  },
  topCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.hairlineStrong,
    backgroundColor: colors.surfaceCard,
    paddingVertical: spacing.sm,
    marginBottom: spacing.xxs,
    ...MedsTheme.elevation.card,
  },
  rowButton: {
    minHeight: 54,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.hairlineStrong,
    backgroundColor: colors.surfaceCard,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    ...MedsTheme.elevation.card,
  },
  rowButtonActive: {
    opacity: 0.88,
  },
  rowButtonText: {
    flex: 1,
    ...typography.titleSm,
    fontFamily: fonts.sansMedium,
    color: colors.ink,
  },
  dangerText: {
    color: colors.critical,
  },
});
