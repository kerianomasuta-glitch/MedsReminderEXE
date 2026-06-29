import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import type { ComponentProps, ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { MedsTheme } from '@/constants/meds-theme';

const { colors, fonts, radius, spacing } = MedsTheme;

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const AVATAR_GRADIENTS: [string, string][] = [
  ['#cfe7ff', '#7eb8f0'],
  ['#d4f5e9', '#5ec9a0'],
  ['#fde8d8', '#f0a878'],
  ['#e8e0ff', '#a894f0'],
  ['#ffe4ec', '#f090b0'],
];

function hashName(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export function formatPatientGender(value?: string) {
  if (value === 'male') return 'Nam';
  if (value === 'female') return 'Nữ';
  if (value === 'other') return 'Khác';
  return 'Không rõ';
}

export function PatientAvatar({ name, size = 48 }: { name: string; size?: number }) {
  const initial = (name.trim()[0] ?? '?').toUpperCase();
  const gradient = AVATAR_GRADIENTS[hashName(name) % AVATAR_GRADIENTS.length];

  return (
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.38 }]}>{initial}</Text>
    </LinearGradient>
  );
}

type PatientListCardProps = {
  name: string;
  meta: string;
  onPress?: () => void;
};

export function PatientListCard({ name, meta, onPress }: PatientListCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.patientCard, pressed && styles.patientCardPressed]}>
      <PatientAvatar name={name} size={52} />
      <View style={styles.patientCardBody}>
        <Text style={styles.patientCardName} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.patientCardMeta} numberOfLines={1}>
          {meta}
        </Text>
      </View>
      <View style={styles.chevronWrap}>
        <Ionicons name="chevron-forward" size={16} color={colors.textLink} />
      </View>
    </Pressable>
  );
}

type FeatureNavCardProps = {
  title: string;
  subtitle: string;
  icon: IoniconName;
  accent: string;
  accentSoft: string;
  onPress?: () => void;
};

export function FeatureNavCard({ title, subtitle, icon, accent, accentSoft, onPress }: FeatureNavCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.featureCard, pressed && styles.featureCardPressed]}>
      <View style={[styles.featureIconWrap, { backgroundColor: accentSoft }]}>
        <Ionicons name={icon} size={26} color={accent} />
      </View>
      <View style={styles.featureBody}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="arrow-forward-circle" size={22} color={accent} />
    </Pressable>
  );
}

type ProfileHeroProps = {
  name: string;
  meta: string;
};

export function PatientProfileHero({ name, meta }: ProfileHeroProps) {
  return (
    <LinearGradient
      colors={[colors.gradientSkyLight, '#e8f2fc', colors.canvas]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.profileHero}>
      <View style={styles.profileHeroGlow} />
      <PatientAvatar name={name} size={72} />
      <Text style={styles.profileHeroName}>{name}</Text>
      <Text style={styles.profileHeroMeta}>{meta}</Text>
    </LinearGradient>
  );
}

type DashboardWelcomeProps = {
  patientCount: number;
  loading?: boolean;
};

export function DashboardWelcomeBanner({ patientCount, loading }: DashboardWelcomeProps) {
  return (
    <LinearGradient
      colors={[colors.surfaceDark, '#2a3f5c']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.welcomeBanner}>
      <View style={styles.welcomeTextWrap}>
        <Text style={styles.welcomeEyebrow}>NGƯỜI THÂN</Text>
        <Text style={styles.welcomeTitle}>Theo dõi sức khỏe{'\n'}người thân yêu</Text>
        <Text style={styles.welcomeSubtitle}>Quản lý đơn thuốc và nhắc lịch uống thuốc mỗi ngày.</Text>
      </View>
      <View style={styles.welcomeStat}>
        {loading ? (
          <ActivityIndicator color={colors.onDark} size="small" />
        ) : (
          <>
            <Text style={styles.welcomeStatValue}>{patientCount}</Text>
            <Text style={styles.welcomeStatLabel}>bệnh nhân</Text>
          </>
        )}
      </View>
    </LinearGradient>
  );
}

type CaregiverLogoutButtonProps = {
  onPress?: () => void;
};

export function CaregiverLogoutButton({ onPress }: CaregiverLogoutButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Đăng xuất"
      style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutButtonPressed]}>
      <View style={styles.logoutIconWrap}>
        <Ionicons name="log-out-outline" size={15} color={colors.critical} />
      </View>
      <Text style={styles.logoutLabel}>Đăng xuất</Text>
    </Pressable>
  );
}

type SectionHeaderProps = {
  title: string;
  icon?: IoniconName;
  action?: ReactNode;
};

export function SectionHeader({ title, icon, action }: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderLeft}>
        {icon ? (
          <View style={styles.sectionIconWrap}>
            <Ionicons name={icon} size={16} color={colors.textLink} />
          </View>
        ) : null}
        <Text style={styles.sectionHeaderTitle}>{title}</Text>
      </View>
      {action}
    </View>
  );
}

type EmptyStateProps = {
  icon: IoniconName;
  title: string;
  message: string;
  accent?: string;
  accentSoft?: string;
};

export function EmptyState({ icon, title, message, accent = colors.textLink, accentSoft = '#E8F4FF' }: EmptyStateProps) {
  return (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIconWrap, { backgroundColor: accentSoft }]}>
        <Ionicons name={icon} size={32} color={accent} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMessage}>{message}</Text>
    </View>
  );
}

type ListItemCardProps = {
  title: string;
  lines?: string[];
  icon: IoniconName;
  accent: string;
  accentSoft: string;
  badge?: { label: string; tone: 'success' | 'muted' };
  onPress?: () => void;
  onDelete?: () => void;
  style?: ViewStyle;
};

export function ListItemCard({
  title,
  lines = [],
  icon,
  accent,
  accentSoft,
  badge,
  onPress,
  onDelete,
  style,
}: ListItemCardProps) {
  const body = (
    <>
      <View style={[styles.listIconWrap, { backgroundColor: accentSoft }]}>
        <Ionicons name={icon} size={20} color={accent} />
      </View>
      <View style={styles.listBody}>
        <View style={styles.listTitleRow}>
          <Text style={styles.listTitle} numberOfLines={1}>
            {title}
          </Text>
          {badge ? (
            <View style={[styles.badge, badge.tone === 'success' ? styles.badgeSuccess : styles.badgeMuted]}>
              <Text style={[styles.badgeText, badge.tone === 'success' ? styles.badgeTextSuccess : styles.badgeTextMuted]}>
                {badge.label}
              </Text>
            </View>
          ) : null}
        </View>
        {lines.map((line) => (
          <Text key={line} style={styles.listMeta} numberOfLines={2}>
            {line}
          </Text>
        ))}
      </View>
      {onPress ? <Ionicons name="chevron-forward" size={18} color={colors.muted} /> : null}
    </>
  );

  if (onPress || onDelete) {
    return (
      <View style={[styles.listCard, style]}>
        {onPress ? (
          <Pressable
            onPress={onPress}
            style={({ pressed }) => [styles.listCardMain, pressed && styles.listCardPressed]}>
            {body}
          </Pressable>
        ) : (
          <View style={styles.listCardMain}>{body}</View>
        )}
        {onDelete ? (
          <Pressable
            onPress={onDelete}
            hitSlop={8}
            style={({ pressed }) => [styles.listDeleteBtn, pressed && styles.listDeleteBtnPressed]}>
            <Ionicons name="trash-outline" size={20} color={colors.critical} />
          </Pressable>
        ) : null}
      </View>
    );
  }

  return <View style={[styles.listCard, style]}>{body}</View>;
}

export function FloatingAddButton({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.floatingAdd, pressed && styles.floatingAddPressed]}>
      <Ionicons name="add" size={20} color={colors.onPrimary} />
      <Text style={styles.floatingAddText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fonts.sansSemiBold,
    color: colors.ink,
  },
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.canvas,
    ...MedsTheme.elevation.card,
  },
  patientCardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.995 }],
  },
  patientCardBody: {
    flex: 1,
    gap: 2,
  },
  patientCardName: {
    fontSize: 17,
    fontFamily: fonts.sansSemiBold,
    color: colors.ink,
  },
  patientCardMeta: {
    fontSize: 13,
    fontFamily: fonts.sans,
    color: colors.body,
  },
  chevronWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E8F4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.base,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surfaceCard,
    ...MedsTheme.elevation.card,
  },
  featureCardPressed: {
    opacity: 0.9,
  },
  featureIconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureBody: {
    flex: 1,
    gap: 3,
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: fonts.sansSemiBold,
    color: colors.ink,
  },
  featureSubtitle: {
    fontSize: 13,
    fontFamily: fonts.sans,
    color: colors.body,
    lineHeight: 18,
  },
  profileHero: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.xxl,
    overflow: 'hidden',
    gap: spacing.xs,
    marginBottom: spacing.xxs,
  },
  profileHeroGlow: {
    position: 'absolute',
    top: -40,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  profileHeroName: {
    marginTop: spacing.xs,
    fontSize: 24,
    fontFamily: fonts.sansSemiBold,
    color: colors.ink,
    textAlign: 'center',
  },
  profileHeroMeta: {
    fontSize: 14,
    fontFamily: fonts.sans,
    color: colors.body,
    textAlign: 'center',
  },
  welcomeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderRadius: radius.xxl,
    overflow: 'hidden',
    gap: spacing.sm,
  },
  welcomeTextWrap: {
    flex: 1,
    gap: 6,
  },
  welcomeEyebrow: {
    fontSize: 11,
    fontFamily: fonts.sansSemiBold,
    letterSpacing: 1.2,
    color: colors.accentLinkBright,
  },
  welcomeTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontFamily: fonts.sansSemiBold,
    color: colors.onDark,
  },
  welcomeSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.sans,
    color: colors.onDarkSoft,
  },
  welcomeStat: {
    width: 72,
    height: 72,
    borderRadius: radius.xl,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  welcomeStatValue: {
    fontSize: 28,
    fontFamily: fonts.sansSemiBold,
    color: colors.onDark,
    lineHeight: 32,
  },
  welcomeStatLabel: {
    fontSize: 11,
    fontFamily: fonts.sans,
    color: colors.onDarkSoft,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 5,
    paddingRight: 12,
    paddingVertical: 5,
    marginRight: spacing.xxs,
    borderRadius: radius.pill,
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: '#F5C6C8',
  },
  logoutButtonPressed: {
    opacity: 0.9,
    backgroundColor: '#FAD9DB',
  },
  logoutIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F5C6C8',
  },
  logoutLabel: {
    fontSize: 13,
    fontFamily: fonts.sansSemiBold,
    color: colors.critical,
    letterSpacing: -0.1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xxs,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sectionIconWrap: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: '#E8F4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeaderTitle: {
    fontSize: 17,
    fontFamily: fonts.sansSemiBold,
    color: colors.ink,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.base,
    gap: spacing.xs,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxs,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: fonts.sansSemiBold,
    color: colors.ink,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 14,
    fontFamily: fonts.sans,
    color: colors.body,
    textAlign: 'center',
    lineHeight: 20,
  },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingRight: spacing.xs,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surfaceCard,
    ...MedsTheme.elevation.card,
  },
  listCardMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.base,
  },
  listCardPressed: {
    opacity: 0.9,
  },
  listDeleteBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.dangerSoft,
  },
  listDeleteBtnPressed: {
    opacity: 0.85,
  },
  listIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listBody: {
    flex: 1,
    gap: 3,
  },
  listTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  listTitle: {
    flex: 1,
    fontSize: 15,
    fontFamily: fonts.sansSemiBold,
    color: colors.ink,
  },
  listMeta: {
    fontSize: 13,
    fontFamily: fonts.sans,
    color: colors.body,
    lineHeight: 18,
  },
  badge: {
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeSuccess: {
    backgroundColor: '#ECFDF3',
  },
  badgeMuted: {
    backgroundColor: colors.surfaceStrong,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: fonts.sansMedium,
  },
  badgeTextSuccess: {
    color: colors.semanticSuccess,
  },
  badgeTextMuted: {
    color: colors.muted,
  },
  floatingAdd: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    minHeight: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    ...MedsTheme.elevation.card,
  },
  floatingAddPressed: {
    backgroundColor: colors.primaryActive,
  },
  floatingAddText: {
    fontSize: 15,
    fontFamily: fonts.sansMedium,
    color: colors.onPrimary,
  },
});
