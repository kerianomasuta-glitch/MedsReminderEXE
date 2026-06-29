import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { MedsTheme } from '@/constants/meds-theme';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

type AppAlertProps = {
  visible: boolean;
  title: string;
  message: string;
  tone?: 'success' | 'warning' | 'error';
  onClose: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
};

const { colors, typography, radius, spacing, fonts } = MedsTheme;

const toneConfig: Record<
  NonNullable<AppAlertProps['tone']>,
  { icon: IoniconName; color: string }
> = {
  success: { icon: 'checkmark-circle', color: colors.semanticSuccess },
  warning: { icon: 'alert-circle', color: colors.accentWarning },
  error: { icon: 'close-circle', color: colors.critical },
};

export function AppAlert({
  visible,
  title,
  message,
  tone = 'warning',
  onClose,
  confirmLabel,
  cancelLabel,
  onConfirm,
}: AppAlertProps) {
  const icon = toneConfig[tone];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name={icon.icon} size={28} color={icon.color} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {cancelLabel && confirmLabel ? (
            <View style={styles.buttonRow}>
              <Pressable
                onPress={onClose}
                style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed]}>
                <Text style={styles.secondaryButtonText}>{cancelLabel}</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  onClose();
                  onConfirm?.();
                }}
                style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
                <Text style={styles.buttonText}>{confirmLabel}</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable onPress={onClose} style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
              <Text style={styles.buttonText}>OK</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    zIndex: 9999,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.hairlineStrong,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.base,
    alignItems: 'center',
    ...MedsTheme.elevation.card,
  },
  iconWrap: {
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.titleMd,
    fontFamily: fonts.sansSemiBold,
    color: colors.ink,
    textAlign: 'center',
  },
  message: {
    marginTop: spacing.xs,
    ...typography.bodyMd,
    fontFamily: fonts.sans,
    color: colors.body,
    textAlign: 'center',
  },
  buttonRow: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
  },
  button: {
    flex: 1,
    minHeight: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    backgroundColor: colors.primaryActive,
  },
  buttonText: {
    ...typography.button,
    fontFamily: fonts.sansMedium,
    color: colors.onPrimary,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.hairlineStrong,
    backgroundColor: colors.surfaceCard,
    paddingHorizontal: spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonPressed: {
    opacity: 0.88,
  },
  secondaryButtonText: {
    ...typography.button,
    fontFamily: fonts.sansMedium,
    color: colors.ink,
  },
});
