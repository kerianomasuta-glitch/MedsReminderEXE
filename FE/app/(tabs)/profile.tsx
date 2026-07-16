import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { formatPatientGender, PatientAvatar } from '@/components/meds/caregiver-ui';
import { GlowOrb, MenuActionTile, type MenuActionTileAccent, StaggerIn } from '@/components/meds/depth-ui';
import { PatientTabHeader } from '@/components/meds/patient-tab-header';
import { profileMenuItems } from '@/constants/app-mock';
import { MedsTheme } from '@/constants/meds-theme';
import { useAuth } from '@/store/auth-store';

const { colors, typography, radius, spacing, fonts } = MedsTheme;

const PROFILE_GRADIENT: [string, string, string] = ['#16345C', colors.brandName, colors.brandNameLight];

const MENU_META: Record<string, { subtitle: string; accent: MenuActionTileAccent }> = {
  'Hồ sơ sức khỏe': {
    subtitle: 'Thông tin cá nhân & bệnh nền',
    accent: {
      gradient: ['#D8E8FA', '#A8C8E8'],
      iconColor: colors.brandName,
      plateColor: 'rgba(27, 61, 110, 0.14)',
      pressedBg: '#EEF4FC',
    },
  },
  'Người thân theo dõi': {
    subtitle: 'Mời & quản lý người chăm sóc',
    accent: {
      gradient: ['#D4F5E9', '#9EDFC0'],
      iconColor: '#15803D',
      plateColor: 'rgba(22, 163, 74, 0.14)',
      pressedBg: '#EDFCF3',
    },
  },
  'Lịch tái khám': {
    subtitle: 'Cuộc hẹn bác sĩ sắp tới',
    accent: {
      gradient: ['#FFE8CC', '#F5C98A'],
      iconColor: '#9A5B00',
      plateColor: 'rgba(171, 100, 0, 0.14)',
      pressedBg: '#FFF8EE',
    },
  },
  'Báo cáo tuân thủ': {
    subtitle: 'Tỷ lệ uống thuốc đúng giờ',
    accent: {
      gradient: ['#E8DEFF', '#C4B0F0'],
      iconColor: '#6D3FA8',
      plateColor: 'rgba(129, 69, 181, 0.14)',
      pressedBg: '#F6F1FF',
    },
  },
  'Đăng xuất': {
    subtitle: 'Thoát khỏi phiên đăng nhập',
    accent: {
      gradient: ['#FFE4E4', '#F5B0B0'],
      iconColor: colors.critical,
      plateColor: 'rgba(198, 53, 53, 0.16)',
      pressedBg: '#FFF1F1',
    },
  },
};

export default function ProfileScreen() {
  const { logout, user } = useAuth();
  const displayName = user?.name?.trim() || 'Bệnh nhân';
  const displayPhone = user?.phone?.trim() || 'Chưa cập nhật';
  const displayEmail = user?.email?.trim();
  const displayGender = formatPatientGender(user?.gender);

  const accountItems = profileMenuItems.filter((item) => !item.danger);
  const logoutItem = profileMenuItems.find((item) => item.danger);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <PatientTabHeader />

        <Animated.View entering={FadeInDown.delay(60).duration(480).springify()} style={styles.heroWrap}>
          <View style={styles.heroShadowPlate} />
          <LinearGradient colors={PROFILE_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroCard}>
            <GlowOrb size={130} color="rgba(255,255,255,0.14)" style={styles.heroGlowRight} />
            <GlowOrb size={70} color="rgba(126,232,168,0.22)" style={styles.heroGlowLeft} />
            <View style={styles.heroShine} pointerEvents="none" />

            <View style={styles.avatarRing}>
              <PatientAvatar name={displayName} size={76} />
            </View>

            <Text style={styles.heroName}>{displayName}</Text>
            <Text style={styles.heroRole}>Tài khoản bệnh nhân</Text>

            <View style={styles.heroMetaRow}>
              <View style={styles.metaPill}>
                <Ionicons name="call-outline" size={13} color={colors.onPrimary} />
                <Text style={styles.metaPillText} numberOfLines={1}>
                  {displayPhone}
                </Text>
              </View>
              <View style={styles.metaPill}>
                <Ionicons name="male-female-outline" size={13} color={colors.onPrimary} />
                <Text style={styles.metaPillText}>{displayGender}</Text>
              </View>
            </View>

            {displayEmail ? (
              <View style={styles.emailPill}>
                <Ionicons name="mail-outline" size={13} color="rgba(255,255,255,0.9)" />
                <Text style={styles.emailPillText} numberOfLines={1}>
                  {displayEmail}
                </Text>
              </View>
            ) : null}
          </LinearGradient>
        </Animated.View>

        <Text style={styles.sectionLabel}>QUẢN LÝ TÀI KHOẢN</Text>

        <View style={styles.menuList}>
          {accountItems.map((item, index) => {
            const meta = MENU_META[item.label];
            return (
              <StaggerIn key={item.label} index={index}>
                <MenuActionTile
                  title={item.label}
                  subtitle={meta?.subtitle ?? ''}
                  icon={item.icon}
                  accent={meta?.accent ?? MENU_META['Hồ sơ sức khỏe'].accent}
                  onPress={() => router.push(item.route)}
                />
              </StaggerIn>
            );
          })}
        </View>

        {logoutItem ? (
          <StaggerIn index={accountItems.length}>
            <MenuActionTile
              title={logoutItem.label}
              subtitle={MENU_META['Đăng xuất'].subtitle}
              icon={logoutItem.icon}
              accent={MENU_META['Đăng xuất'].accent}
              danger
              onPress={() => void logout()}
            />
          </StaggerIn>
        ) : null}

        <Text style={styles.footerNote}>MedsReminder · Phiên bản 1.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.canvasSoft,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: 110,
    gap: spacing.sm,
  },
  heroWrap: {
    position: 'relative',
    marginTop: spacing.xxs,
  },
  heroShadowPlate: {
    position: 'absolute',
    left: 6,
    right: 6,
    top: 8,
    bottom: -6,
    borderRadius: radius.xl,
    backgroundColor: 'rgba(12, 36, 68, 0.34)',
    ...MedsTheme.elevation.hero,
  },
  heroCard: {
    borderRadius: radius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.base,
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  heroGlowRight: {
    top: -36,
    right: -28,
  },
  heroGlowLeft: {
    bottom: -10,
    left: -24,
  },
  heroShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  avatarRing: {
    padding: 4,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.45)',
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  heroName: {
    ...typography.displayMd,
    fontFamily: fonts.sansSemiBold,
    color: colors.onPrimary,
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  heroRole: {
    marginTop: 4,
    ...typography.bodySm,
    fontFamily: fonts.sansMedium,
    color: 'rgba(255,255,255,0.82)',
  },
  heroMetaRow: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    maxWidth: '48%',
  },
  metaPillText: {
    ...typography.caption,
    fontFamily: fonts.sansMedium,
    color: colors.onPrimary,
  },
  emailPill: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.12)',
    maxWidth: '92%',
  },
  emailPillText: {
    ...typography.caption,
    fontFamily: fonts.sans,
    color: 'rgba(255,255,255,0.9)',
    flex: 1,
  },
  sectionLabel: {
    ...typography.captionUppercase,
    fontFamily: fonts.sansSemiBold,
    color: colors.muted,
    letterSpacing: 1,
    marginTop: spacing.xxs,
  },
  menuList: {
    gap: spacing.sm,
  },
  footerNote: {
    marginTop: spacing.xs,
    textAlign: 'center',
    ...typography.caption,
    fontFamily: fonts.sans,
    color: colors.muted,
  },
});
