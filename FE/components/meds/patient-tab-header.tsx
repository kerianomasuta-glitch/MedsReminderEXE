import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { DepthPressable, FloatingLogo } from '@/components/meds/depth-ui';
import { MedsTheme } from '@/constants/meds-theme';

const { colors, radius, spacing, fonts } = MedsTheme;

type PatientTabHeaderProps = {
  showNotification?: boolean;
};

function NotificationButton() {
  return (
    <DepthPressable depth="sm" onPress={() => router.push('/reminder')} style={styles.notifWrap}>
      <View style={styles.iconButton}>
        <Ionicons name="notifications-outline" size={20} color={colors.brandName} />
        <View style={styles.notifDot} />
      </View>
    </DepthPressable>
  );
}

export function PatientTabHeader({ showNotification = true }: PatientTabHeaderProps) {
  return (
    <Animated.View entering={FadeInDown.duration(400).springify()} style={styles.headerShell}>
      <View style={styles.headerRow}>
        <View style={styles.sideSpacer} />

        <View style={styles.brandCenter} pointerEvents="none">
          <FloatingLogo>
            <View style={styles.logoBadge}>
              <Image
                source={require('@/assets/images/medsreminder-icon-transparent.png')}
                style={styles.logo}
                contentFit="contain"
              />
            </View>
          </FloatingLogo>
          <View style={styles.brandTextWrap}>
            <Text style={styles.brandName} numberOfLines={1}>
              MedsReminder
            </Text>
            <Text style={styles.brandTagline} numberOfLines={1}>
              Nhắc uống thuốc đúng giờ
            </Text>
          </View>
        </View>

        <View style={styles.sideSlot}>
          {showNotification ? <NotificationButton /> : <View style={styles.iconButtonPlaceholder} />}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  headerShell: {
    marginHorizontal: -spacing.md,
    marginTop: -spacing.sm,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    backgroundColor: colors.canvas,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 54,
  },
  sideSpacer: {
    flex: 1,
    minHeight: 44,
  },
  sideSlot: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minHeight: 44,
  },
  brandCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: spacing.xxs,
  },
  logoBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.hairlineStrong,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  logo: {
    width: 38,
    height: 38,
  },
  brandTextWrap: {
    gap: 1,
    maxWidth: 168,
  },
  brandName: {
    fontSize: 19,
    lineHeight: 24,
    fontFamily: fonts.sansSemiBold,
    color: colors.brandName,
    letterSpacing: -0.4,
  },
  brandTagline: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: fonts.sans,
    color: colors.body,
    letterSpacing: 0.1,
  },
  notifWrap: {
    alignSelf: 'flex-end',
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: colors.brandNameSoft,
    borderWidth: 1,
    borderColor: colors.hairlineStrong,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonPlaceholder: {
    width: 38,
    height: 38,
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.semanticSuccess,
    borderWidth: 1.5,
    borderColor: colors.surfaceCard,
  },
});
