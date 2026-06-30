import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MedsTheme } from '@/constants/meds-theme';

const { colors, radius, spacing, fonts } = MedsTheme;

const HEADER_BLUE = colors.brandName;

type PatientTabHeaderProps = {
  showNotification?: boolean;
};

export function PatientTabHeader({ showNotification = true }: PatientTabHeaderProps) {
  return (
    <View style={styles.headerShell}>
      <View style={styles.headerRow}>
        <View style={styles.sideSpacer} />

        <View style={styles.brandCenter} pointerEvents="none">
          <Image
            source={require('@/assets/images/medsreminder-icon-transparent.png')}
            style={styles.logo}
            contentFit="contain"
          />
          <Text style={styles.brandName} numberOfLines={1}>
            MedsReminder
          </Text>
        </View>

        <View style={styles.sideSlot}>
          {showNotification ? (
            <Pressable style={styles.iconButton} onPress={() => router.push('/reminder')} hitSlop={8}>
              <Ionicons name="notifications-outline" size={20} color={colors.onPrimary} />
            </Pressable>
          ) : (
            <View style={styles.iconButton} />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerShell: {
    marginHorizontal: -spacing.md,
    marginTop: -spacing.sm,
    marginBottom: spacing.xxs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: HEADER_BLUE,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  sideSpacer: {
    flex: 1,
    minHeight: 34,
  },
  sideSlot: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minHeight: 34,
  },
  brandCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.xxs,
  },
  logo: {
    width: 36,
    height: 36,
  },
  brandName: {
    fontSize: 18,
    lineHeight: 22,
    fontFamily: fonts.sansSemiBold,
    color: colors.onPrimary,
    letterSpacing: -0.3,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
