import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';

import { DepthPressable } from '@/components/meds/depth-ui';
import { MedsTheme } from '@/constants/meds-theme';

const { colors, typography, radius, spacing, fonts } = MedsTheme;

export function SubScreen({ children, paddedBottom = 32 }: { children: ReactNode; paddedBottom?: number }) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 0}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={[styles.content, { paddingBottom: paddedBottom + insets.bottom }]}>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function SubScreenIntro({ subtitle }: { subtitle: string }) {
  return (
    <Animated.View entering={FadeInDown.duration(420).springify()} style={styles.intro}>
      <Text style={styles.introText}>{subtitle}</Text>
    </Animated.View>
  );
}

export function SectionLabel({ text }: { text: string }) {
  return <Text style={styles.sectionLabel}>{text}</Text>;
}

export function DepthChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <DepthPressable depth="sm" onPress={onPress}>
      <View style={[styles.chip, active && styles.chipActive]}>
        <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
      </View>
    </DepthPressable>
  );
}

export function StatTile({
  label,
  value,
  tone = 'brand',
  style,
}: {
  label: string;
  value: string;
  tone?: 'brand' | 'success' | 'warning' | 'danger';
  style?: ViewStyle;
}) {
  const toneStyle = STAT_TONES[tone];
  return (
    <View style={[styles.statTile, { backgroundColor: toneStyle.bg, borderColor: toneStyle.border }, style]}>
      <Text style={[styles.statValue, { color: toneStyle.value }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: toneStyle.label }]}>{label}</Text>
    </View>
  );
}

const STAT_TONES = {
  brand: { bg: colors.brandNameSoft, border: 'rgba(27,61,110,0.12)', value: colors.brandName, label: colors.body },
  success: { bg: '#ECFDF3', border: '#BBF7D0', value: colors.semanticSuccess, label: colors.body },
  warning: { bg: '#FFF8EE', border: '#F0D9A8', value: colors.accentWarning, label: colors.body },
  danger: { bg: colors.dangerSoft, border: colors.semanticError, value: colors.critical, label: colors.body },
} as const;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.canvasSoft,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  intro: {
    marginBottom: spacing.xxs,
  },
  introText: {
    ...typography.bodySm,
    fontFamily: fonts.sans,
    color: colors.body,
    lineHeight: 21,
  },
  sectionLabel: {
    ...typography.captionUppercase,
    fontFamily: fonts.sansSemiBold,
    color: colors.muted,
    letterSpacing: 1,
    marginBottom: spacing.xxs,
  },
  chip: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.hairlineStrong,
    backgroundColor: colors.surfaceCard,
  },
  chipActive: {
    backgroundColor: colors.brandNameSoft,
    borderColor: colors.brandName,
  },
  chipText: {
    ...typography.bodySm,
    fontFamily: fonts.sansMedium,
    color: colors.body,
  },
  chipTextActive: {
    color: colors.brandName,
    fontFamily: fonts.sansSemiBold,
  },
  statTile: {
    width: '48%',
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    gap: 4,
    ...MedsTheme.elevation.card,
  },
  statValue: {
    fontSize: 22,
    lineHeight: 26,
    fontFamily: fonts.sansSemiBold,
    letterSpacing: -0.5,
  },
  statLabel: {
    ...typography.caption,
    fontFamily: fonts.sansMedium,
  },
});
