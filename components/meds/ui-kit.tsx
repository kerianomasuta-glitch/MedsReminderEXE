import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, type TextInputProps, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MedsTheme } from '@/constants/meds-theme';

type ScreenProps = {
  children: ReactNode;
  paddedBottom?: number;
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

const toneStyle = {
  primary: { bg: MedsTheme.colors.primary, text: '#FFFFFF', border: MedsTheme.colors.primary },
  secondary: { bg: '#FFFFFF', text: MedsTheme.colors.textMain, border: MedsTheme.colors.border },
  danger: { bg: '#FCECEC', text: MedsTheme.colors.danger, border: '#F6C7C7' },
  warning: { bg: '#FFF1DF', text: '#A65A00', border: '#F8D6AC' },
  success: { bg: '#E4F5EC', text: MedsTheme.colors.success, border: '#BCE9CF' },
} as const;

export function AppScreen({ children, paddedBottom = 30 }: ScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: paddedBottom }]}>
        {children}
      </ScrollView>
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

export function SectionCard({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function FieldLabel({ text }: { text: string }) {
  return <Text style={styles.fieldLabel}>{text}</Text>;
}

export function TextField({ label, hint, error, ...props }: TextFieldProps) {
  return (
    <View style={styles.fieldBlock}>
      <FieldLabel text={label} />
      <TextInput
        placeholderTextColor="#90A0B5"
        style={[styles.input, error && styles.inputError]}
        {...props}
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
      style={({ pressed, hovered }) => [
        styles.chip,
        active && styles.chipActive,
        (pressed || hovered) && styles.chipHover,
      ]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

export function ActionButton({ label, onPress, tone = 'primary', icon }: ButtonProps) {
  const picked = toneStyle[tone];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed, hovered }) => [
        styles.button,
        {
          backgroundColor: picked.bg,
          borderColor: picked.border,
        },
        (pressed || hovered) && styles.buttonActive,
      ]}>
      {icon}
      <Text style={[styles.buttonText, { color: picked.text }]}>{label}</Text>
    </Pressable>
  );
}

export function BrandHeader({ slogan }: { slogan: string }) {
  return (
    <View style={styles.brandWrap}>
      <Image source={require('@/assets/images/medsreminder-logo-transparent.png')} style={styles.brandLogo} contentFit="contain" />
      <Text style={styles.brandName}>MedsReminder</Text>
      <Text style={styles.brandSlogan}>{slogan}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: MedsTheme.colors.appBackground,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 14,
    gap: 12,
  },
  headerWrap: {
    marginBottom: 2,
  },
  pageTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: MedsTheme.colors.textMain,
  },
  pageSubtitle: {
    marginTop: 2,
    fontSize: 15,
    color: MedsTheme.colors.textMuted,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: MedsTheme.colors.border,
    backgroundColor: MedsTheme.colors.card,
    padding: 14,
    gap: 10,
  },
  fieldBlock: {
    gap: 7,
  },
  fieldLabel: {
    color: MedsTheme.colors.textMain,
    fontSize: 15,
    fontWeight: '700',
  },
  input: {
    minHeight: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MedsTheme.colors.border,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    fontSize: 16,
    color: MedsTheme.colors.textMain,
  },
  inputError: {
    borderColor: '#E06060',
    backgroundColor: '#FFF6F6',
  },
  fieldHint: {
    color: MedsTheme.colors.textMuted,
    fontSize: 12,
  },
  fieldError: {
    color: '#D23B3B',
    fontSize: 12,
    fontWeight: '600',
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: MedsTheme.colors.border,
    backgroundColor: '#FFFFFF',
  },
  chipActive: {
    borderColor: '#7CB6FA',
    backgroundColor: '#EAF3FF',
  },
  chipHover: {
    opacity: 0.9,
  },
  chipText: {
    color: MedsTheme.colors.textMain,
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: MedsTheme.colors.primaryDark,
  },
  button: {
    minHeight: 50,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  buttonActive: {
    opacity: 0.9,
    transform: [{ scale: 0.995 }],
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  brandWrap: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
  },
  brandLogo: {
    width: 165,
    height: 165,
  },
  brandName: {
    marginTop: 2,
    fontSize: 32,
    fontWeight: '800',
    color: MedsTheme.colors.primaryDark,
  },
  brandSlogan: {
    fontSize: 15,
    color: MedsTheme.colors.textMuted,
    textAlign: 'center',
  },
});
