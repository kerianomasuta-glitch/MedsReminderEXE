import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

type FeedbackTone = 'success' | 'info' | 'warning';

type FeedbackToastProps = {
  message: string | null;
  tone?: FeedbackTone;
  durationMs?: number;
  onHide?: () => void;
};

const toneColors: Record<FeedbackTone, { bg: string; border: string; text: string; icon: string; iconName: 'checkmark-circle' | 'information-circle' | 'alert-circle' }> = {
  success: {
    bg: '#E8F8EF',
    border: '#BEE8CF',
    text: '#146C47',
    icon: '#1D8F5D',
    iconName: 'checkmark-circle',
  },
  info: {
    bg: '#EAF3FF',
    border: '#CDE1FF',
    text: '#174D95',
    icon: '#2C6FCE',
    iconName: 'information-circle',
  },
  warning: {
    bg: '#FFF3E3',
    border: '#F6D6AB',
    text: '#8D5600',
    icon: '#B87400',
    iconName: 'alert-circle',
  },
};

export function FeedbackToast({ message, tone = 'success', durationMs = 1800, onHide }: FeedbackToastProps) {
  const [displayMessage, setDisplayMessage] = useState<string | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    if (!message) return;

    setDisplayMessage(message);

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 180,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -4,
          duration: 180,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setDisplayMessage(null);
        onHide?.();
      });
    }, durationMs);

    return () => clearTimeout(timer);
  }, [durationMs, message, onHide, opacity, translateY]);

  if (!displayMessage) return null;

  const picked = toneColors[tone];

  return (
    <Animated.View
      style={[
        styles.toast,
        { backgroundColor: picked.bg, borderColor: picked.border, opacity, transform: [{ translateY }] },
      ]}>
      <View style={styles.row}>
        <Ionicons name={picked.iconName} size={18} color={picked.icon} />
        <Text style={[styles.text, { color: picked.text }]}>{displayMessage}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    flex: 1,
    fontWeight: '700',
    lineHeight: 18,
  },
});
