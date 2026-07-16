import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps, ReactNode } from 'react';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  FadeInDown,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { MedsTheme } from '@/constants/meds-theme';

const { colors, radius, spacing, fonts, typography } = MedsTheme;

const SPRING_PRESS = { damping: 16, stiffness: 360, mass: 0.55 };
const SPRING_RELEASE = { damping: 14, stiffness: 280, mass: 0.65 };

type DepthLevel = 'sm' | 'md' | 'lg';

const DEPTH_PRESS: Record<DepthLevel, { scale: number; translateY: number }> = {
  sm: { scale: 0.988, translateY: 1 },
  md: { scale: 0.972, translateY: 3 },
  lg: { scale: 0.958, translateY: 5 },
};

type DepthPressableProps = {
  children: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  depth?: DepthLevel;
};

export function DepthPressable({
  children,
  onPress,
  disabled,
  style,
  depth = 'md',
}: DepthPressableProps) {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const press = DEPTH_PRESS[depth];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(press.scale, SPRING_PRESS);
        translateY.value = withSpring(press.translateY, SPRING_PRESS);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, SPRING_RELEASE);
        translateY.value = withSpring(0, SPRING_RELEASE);
      }}>
      <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
    </Pressable>
  );
}

type DepthCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  plateColor?: string;
  onPress?: () => void;
  depth?: DepthLevel;
};

export function DepthCard({
  children,
  style,
  plateColor = 'rgba(27, 61, 110, 0.14)',
  onPress,
  depth = 'md',
}: DepthCardProps) {
  const content = (
    <Animated.View style={styles.depthCardWrap}>
      <View style={[styles.shadowPlate, { backgroundColor: plateColor }]} />
      <View style={[styles.depthCardSurface, style]}>{children}</View>
    </Animated.View>
  );

  if (onPress) {
    return (
      <DepthPressable onPress={onPress} depth={depth}>
        {content}
      </DepthPressable>
    );
  }

  return content;
}

type DepthHeroProps = {
  children: ReactNode;
  colors?: [string, string, ...string[]];
  style?: StyleProp<ViewStyle>;
};

export function DepthHero({
  children,
  colors: gradientColors = [colors.brandName, '#234B7A', colors.brandNameLight],
  style,
}: DepthHeroProps) {
  return (
    <Animated.View entering={FadeInDown.duration(520).springify().damping(18)} style={styles.heroWrap}>
      <View style={styles.heroShadowPlate} />
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.heroGradient, style]}>
        <View style={styles.heroShine} pointerEvents="none" />
        <View style={styles.heroInnerEdge} pointerEvents="none" />
        {children}
      </LinearGradient>
    </Animated.View>
  );
}

type DepthButtonProps = {
  label: string;
  onPress?: () => void;
  icon?: ReactNode;
  tone?: 'light' | 'brand';
  disabled?: boolean;
};

export function DepthButton({ label, onPress, icon, tone = 'light', disabled }: DepthButtonProps) {
  const isLight = tone === 'light';

  return (
    <DepthPressable onPress={onPress} disabled={disabled} depth="sm" style={styles.depthButtonWrap}>
      <View
        style={[
          styles.depthButtonPlate,
          isLight ? styles.depthButtonPlateLight : styles.depthButtonPlateBrand,
        ]}
      />
      <View style={[styles.depthButtonSurface, isLight ? styles.depthButtonLight : styles.depthButtonBrand]}>
        {icon}
        <Animated.Text
          style={[styles.depthButtonText, isLight ? styles.depthButtonTextLight : styles.depthButtonTextBrand]}>
          {label}
        </Animated.Text>
      </View>
    </DepthPressable>
  );
}

export function GlowOrb({
  size = 120,
  color = 'rgba(255,255,255,0.14)',
  style,
}: {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      pointerEvents="none"
      style={[
        styles.glowOrb,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

export function FloatingLogo({ children }: { children: ReactNode }) {
  const floatY = useSharedValue(0);

  useEffect(() => {
    floatY.value = withRepeat(
      withSequence(withTiming(-2.5, { duration: 2200 }), withTiming(2.5, { duration: 2200 })),
      -1,
      true,
    );
  }, [floatY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}

export function StaggerIn({
  children,
  index = 0,
  style,
}: {
  children: ReactNode;
  index?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 70)
        .duration(420)
        .springify()
        .damping(20)}
      style={style}>
      {children}
    </Animated.View>
  );
}

type IoniconName = ComponentProps<typeof Ionicons>['name'];

export type MenuActionTileAccent = {
  gradient: [string, string];
  iconColor: string;
  plateColor: string;
  pressedBg: string;
};

type MenuActionTileProps = {
  title: string;
  subtitle: string;
  icon: IoniconName;
  accent: MenuActionTileAccent;
  danger?: boolean;
  onPress: () => void;
};

export function MenuActionTile({ title, subtitle, icon, accent, danger, onPress }: MenuActionTileProps) {
  const pressed = useSharedValue(0);

  const tileStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(pressed.value, [0, 1], [1, 0.975]) },
      { translateY: interpolate(pressed.value, [0, 1], [0, 2]) },
    ],
    backgroundColor: interpolateColor(
      pressed.value,
      [0, 1],
      [colors.surfaceCard, danger ? '#FFF1F1' : accent.pressedBg],
    ),
    borderColor: interpolateColor(
      pressed.value,
      [0, 1],
      ['rgba(255,255,255,0.95)', danger ? 'rgba(198, 53, 53, 0.28)' : 'rgba(27, 61, 110, 0.22)'],
    ),
  }));

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(pressed.value, [0, 1], [0, 4]) }],
    opacity: interpolate(pressed.value, [0, 1], [0.55, 1]),
  }));

  const iconScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pressed.value, [0, 1], [1, 1.06]) }],
  }));

  const handlePressIn = () => {
    pressed.value = withTiming(1, { duration: 120 });
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    pressed.value = withSpring(0, SPRING_RELEASE);
  };

  return (
    <View style={styles.menuTileWrap}>
      <View style={[styles.menuTilePlate, { backgroundColor: accent.plateColor }]} />
      <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <Animated.View style={[styles.menuTileSurface, tileStyle]}>
          <Animated.View style={iconScaleStyle}>
            {danger ? (
              <View style={styles.menuTileIconDanger}>
                <Ionicons name={icon} size={20} color={colors.critical} />
              </View>
            ) : (
              <LinearGradient colors={accent.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.menuTileIcon}>
                <Ionicons name={icon} size={20} color={accent.iconColor} />
              </LinearGradient>
            )}
          </Animated.View>

          <View style={styles.menuTileText}>
            <Text style={[styles.menuTileTitle, danger && styles.menuTileTitleDanger]}>{title}</Text>
            <Text style={[styles.menuTileSubtitle, danger && styles.menuTileSubtitleDanger]} numberOfLines={1}>
              {subtitle}
            </Text>
          </View>

          <Animated.View style={[styles.menuTileChevron, chevronStyle]}>
            <Ionicons name="chevron-forward" size={16} color={danger ? colors.critical : colors.brandName} />
          </Animated.View>
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  depthCardWrap: {
    position: 'relative',
  },
  shadowPlate: {
    position: 'absolute',
    left: 4,
    right: 4,
    top: 6,
    bottom: -4,
    borderRadius: radius.lg,
    opacity: 0.55,
  },
  depthCardSurface: {
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    borderTopColor: '#FFFFFF',
    ...MedsTheme.elevation.card,
    shadowColor: colors.brandName,
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  heroWrap: {
    position: 'relative',
  },
  heroShadowPlate: {
    position: 'absolute',
    left: 6,
    right: 6,
    top: 10,
    bottom: -8,
    borderRadius: radius.xl,
    backgroundColor: 'rgba(12, 36, 68, 0.45)',
    shadowColor: colors.brandName,
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 16 },
    elevation: 12,
  },
  heroGradient: {
    borderRadius: radius.xl,
    padding: spacing.base + 2,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: colors.brandName,
    shadowOpacity: 0.3,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  heroShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '42%',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  heroInnerEdge: {
    position: 'absolute',
    top: 1,
    left: 12,
    right: 12,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: radius.pill,
  },
  depthButtonWrap: {
    marginTop: spacing.base,
  },
  depthButtonPlate: {
    position: 'absolute',
    left: 3,
    right: 3,
    top: 5,
    bottom: -3,
    borderRadius: radius.lg,
  },
  depthButtonPlateLight: {
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  depthButtonPlateBrand: {
    backgroundColor: 'rgba(12, 36, 68, 0.35)',
  },
  depthButtonSurface: {
    minHeight: 48,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.85)',
  },
  depthButtonLight: {
    backgroundColor: colors.onPrimary,
    borderColor: 'rgba(255,255,255,0.6)',
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  depthButtonBrand: {
    backgroundColor: colors.brandName,
    borderColor: 'rgba(255,255,255,0.25)',
    shadowColor: colors.brandName,
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  depthButtonText: {
    ...typography.button,
    fontFamily: fonts.sansSemiBold,
    fontSize: 15,
  },
  depthButtonTextLight: {
    color: colors.brandName,
  },
  depthButtonTextBrand: {
    color: colors.onPrimary,
  },
  glowOrb: {
    position: 'absolute',
  },
  menuTileWrap: {
    position: 'relative',
  },
  menuTilePlate: {
    position: 'absolute',
    left: 5,
    right: 5,
    top: 5,
    bottom: -4,
    borderRadius: radius.lg,
    opacity: 0.65,
  },
  menuTileSurface: {
    minHeight: 72,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.sm + 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    ...MedsTheme.elevation.card,
    shadowColor: colors.brandName,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  menuTileIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.md + 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  menuTileIconDanger: {
    width: 46,
    height: 46,
    borderRadius: radius.md + 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: 'rgba(198, 53, 53, 0.18)',
  },
  menuTileText: {
    flex: 1,
    gap: 3,
  },
  menuTileTitle: {
    ...typography.titleSm,
    fontFamily: fonts.sansSemiBold,
    color: colors.ink,
  },
  menuTileTitleDanger: {
    color: colors.critical,
  },
  menuTileSubtitle: {
    ...typography.caption,
    fontFamily: fonts.sans,
    color: colors.body,
  },
  menuTileSubtitleDanger: {
    color: '#B44B4B',
  },
  menuTileChevron: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.brandNameSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
