import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useHeaderHeight } from '@react-navigation/elements';
import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { MedsTheme } from '@/constants/meds-theme';

type ScreenProps = {
  children: ReactNode;
  paddedBottom?: number;
  hero?: boolean;
};

type HeaderProps = {
  title: string;
  subtitle?: string;
};

type ButtonProps = {
  label: string;
  onPress?: () => void;
  tone?: 'primary' | 'secondary' | 'danger' | 'warning' | 'success';
  icon?: React.ReactNode;
};

type TextFieldProps = TextInputProps & {
  label: string;
  hint?: string;
  error?: string;
};

type ChoiceChipProps = {
  label: string;
  active?: boolean;
  onPress?: () => void;
};

const { colors, typography, radius, spacing, fonts } = MedsTheme;

const toneStyle = {
  primary: { bg: colors.primary, text: colors.onPrimary, border: colors.primary },
  secondary: { bg: colors.surfaceCard, text: colors.ink, border: colors.hairlineStrong },
  danger: { bg: colors.dangerSoft, text: colors.critical, border: colors.semanticError },
  warning: { bg: '#FFF8EE', text: colors.accentWarning, border: '#F0D9A8' },
  success: { bg: '#ECFDF3', text: colors.semanticSuccess, border: '#BBF7D0' },
} as const;

export function AppScreen({ children, paddedBottom = 30, hero = false }: ScreenProps) {
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();

  const content = (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 0}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={[styles.content, styles.contentGrow, { paddingBottom: paddedBottom + insets.bottom }]}>
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );

  if (hero) {
    return (
      <View style={[styles.flex, { backgroundColor: colors.gradientSkyLight }]}>
        <LinearGradient
          colors={[colors.gradientSkyLight, colors.canvas, colors.canvas]}
          locations={[0, 0.35, 1]}
          style={[styles.heroGradient, { paddingTop: insets.top }]}>
          {content}
        </LinearGradient>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {content}
    </SafeAreaView>
  );
}

export function PageHeader({ title, subtitle }: HeaderProps) {
  return (
    <View style={styles.headerWrap}>
      <Text style={styles.pageTitle}>{title}</Text>
      {subtitle ? <Text style={styles.pageSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function SectionCard({ children, style, dark }: { children: ReactNode; style?: ViewStyle; dark?: boolean }) {
  return <View style={[styles.card, dark && styles.cardDark, style]}>{children}</View>;
}

export function FieldLabel({ text }: { text: string }) {
  return <Text style={styles.fieldLabel}>{text}</Text>;
}

export function TextField({ label, hint, error, ...props }: TextFieldProps) {
  const { style, ...rest } = props as TextInputProps & { style?: ViewStyle };
  return (
    <View style={styles.fieldBlock}>
      <FieldLabel text={label} />
      <TextInput
        placeholderTextColor={colors.muted}
        style={[styles.input, error && styles.inputError, style]}
        {...rest}
      />
      {hint ? <Text style={styles.fieldHint}>{hint}</Text> : null}
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

export function ChoiceChip({ label, active, onPress }: ChoiceChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && styles.chipPressed]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

export function ActionButton({ label, onPress, tone = 'primary', icon }: ButtonProps) {
  const picked = toneStyle[tone];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: tone === 'primary' && pressed ? colors.primaryActive : picked.bg,
          borderColor: picked.border,
        },
        tone === 'primary' && pressed && styles.buttonPrimaryPressed,
      ]}>
      {icon}
      <Text style={[styles.buttonText, { color: picked.text }]}>{label}</Text>
    </Pressable>
  );
}

/** Logo, app name and slogan — kept as brand identity */
export function BrandHeader({ slogan }: { slogan: string }) {
  return (
    <View style={styles.brandWrap}>
      <Image
        source={require('@/assets/images/medsreminder-icon-transparent.png')}
        style={styles.brandIcon}
        contentFit="contain"
      />
      <Text style={styles.brandName}>MedsReminder</Text>
      <Text style={styles.brandSlogan}>{slogan}</Text>
    </View>
  );
}

export function BadgePill({ label }: { label: string }) {
  return (
    <View style={styles.badgePill}>
      <Text style={styles.badgePillText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  flex: {
    flex: 1,
  },
  heroGradient: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  contentGrow: {
    flexGrow: 1,
  },
  headerWrap: {
    marginBottom: spacing.xxs,
  },
  pageTitle: {
    ...typography.displayLg,
    fontFamily: fonts.sansSemiBold,
    color: colors.ink,
  },
  pageSubtitle: {
    marginTop: spacing.xxs,
    ...typography.bodySm,
    fontFamily: fonts.sans,
    color: colors.body,
  },
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.hairlineStrong,
    backgroundColor: colors.surfaceCard,
    padding: spacing.lg,
    gap: spacing.sm,
    ...MedsTheme.elevation.card,
  },
  cardDark: {
    backgroundColor: colors.surfaceDark,
    borderColor: colors.surfaceDark,
  },
  fieldBlock: {
    gap: 7,
  },
  fieldLabel: {
    ...typography.titleSm,
    fontFamily: fonts.sansSemiBold,
    color: colors.ink,
  },
  input: {
    minHeight: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.hairlineStrong,
    backgroundColor: colors.surfaceCard,
    paddingHorizontal: spacing.base,
    ...typography.bodyMd,
    fontFamily: fonts.sans,
    color: colors.ink,
  },
  inputError: {
    borderColor: colors.semanticError,
    backgroundColor: '#FFF9F9',
  },
  fieldHint: {
    ...typography.caption,
    fontFamily: fonts.sans,
    color: colors.muted,
  },
  fieldError: {
    ...typography.caption,
    fontFamily: fonts.sansMedium,
    color: colors.critical,
  },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.hairlineStrong,
    backgroundColor: colors.surfaceCard,
  },
  chipActive: {
    borderColor: colors.ink,
    backgroundColor: colors.surfaceStrong,
  },
  chipPressed: {
    opacity: 0.88,
  },
  chipText: {
    ...typography.bodySm,
    fontFamily: fonts.sansMedium,
    color: colors.body,
  },
  chipTextActive: {
    color: colors.ink,
    fontFamily: fonts.sansSemiBold,
  },
  button: {
    minHeight: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  buttonPrimaryPressed: {
    opacity: 0.95,
  },
  buttonText: {
    ...typography.button,
    fontFamily: fonts.sansMedium,
  },
  brandWrap: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  brandIcon: {
    width: 140,
    height: 140,
  },
  brandName: {
    marginTop: spacing.xxs,
    fontSize: 32,
    fontFamily: fonts.sansSemiBold,
    fontWeight: '600',
    color: colors.brandName,
  },
  brandSlogan: {
    ...typography.bodySm,
    fontFamily: fonts.sans,
    color: colors.brandSlogan,
    textAlign: 'center',
  },
  badgePill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceStrong,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: spacing.xxs,
  },
  badgePillText: {
    ...typography.captionUppercase,
    fontFamily: fonts.sansSemiBold,
    color: colors.ink,
  },
});
