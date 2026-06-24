import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen, SectionCard } from '@/components/meds/ui-kit';
import { reminderSkipReasons } from '@/constants/app-mock';
import { MedsTheme } from '@/constants/meds-theme';

export default function ReminderScreen() {
  const [showToast, setShowToast] = useState(false);
  const [toastText, setToastText] = useState('Đã đặt nhắc lại sau 15 phút');
  const [showSkipModal, setShowSkipModal] = useState(false);

  useEffect(() => {
    if (!showToast) return;
    const timer = setTimeout(() => setShowToast(false), 1800);
    return () => clearTimeout(timer);
  }, [showToast]);

  return (
    <AppScreen>
      <SectionCard style={styles.hero}>
        <Text style={styles.title}>Đến giờ uống thuốc</Text>
        <Text style={styles.time}>08:00 AM</Text>

        <View style={styles.iconWrap}>
          <Ionicons name="medkit" size={48} color={MedsTheme.colors.primaryDark} />
        </View>

        <Text style={styles.name}>Vitamin C</Text>
        <Text style={styles.meta}>Liều lượng: 1 viên</Text>
        <Text style={styles.meta}>Ghi chú: Sau khi ăn, uống với nhiều nước</Text>

        <Pressable
          style={[styles.largeBtn, styles.successBtn]}
          onPress={() => {
            setToastText('Đã xác nhận uống thuốc');
            setShowToast(true);
          }}>
          <Text style={styles.successText}>Đã uống</Text>
        </Pressable>
        <Pressable
          style={[styles.largeBtn, styles.warningBtn]}
          onPress={() => {
            setToastText('Đã đặt nhắc lại sau 15 phút');
            setShowToast(true);
          }}>
          <Text style={styles.warningText}>Nhắc lại sau 15 phút</Text>
        </Pressable>
        <Pressable style={[styles.largeBtn, styles.skipBtn]} onPress={() => setShowSkipModal(true)}>
          <Text style={styles.skipText}>Bỏ qua</Text>
        </Pressable>
      </SectionCard>

      {showToast ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastText}</Text>
        </View>
      ) : null}

      <Modal transparent animationType="fade" visible={showSkipModal} onRequestClose={() => setShowSkipModal(false)}>
        <View style={styles.overlay}>
          <SectionCard style={styles.reasonCard}>
            <Text style={styles.reasonTitle}>Lý do bỏ qua (tuỳ chọn)</Text>
            {reminderSkipReasons.map((reason) => (
              <Pressable
                key={reason}
                style={styles.reasonRow}
                onPress={() => {
                  setShowSkipModal(false);
                  setToastText(`Đã ghi nhận: ${reason}`);
                  setShowToast(true);
                }}>
                <Text style={styles.reasonText}>{reason}</Text>
              </Pressable>
            ))}
            <Pressable style={styles.closeBtn} onPress={() => setShowSkipModal(false)}>
              <Text style={styles.closeText}>Đóng</Text>
            </Pressable>
          </SectionCard>
        </View>
      </Modal>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingTop: 18,
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: MedsTheme.colors.textMain,
    textAlign: 'center',
  },
  time: {
    fontSize: 42,
    fontWeight: '800',
    color: MedsTheme.colors.primaryDark,
  },
  iconWrap: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 1,
    borderColor: MedsTheme.colors.border,
    backgroundColor: '#EAF3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    marginTop: 4,
    fontSize: 26,
    fontWeight: '800',
    color: MedsTheme.colors.textMain,
  },
  meta: {
    color: MedsTheme.colors.textMuted,
    fontSize: 15,
    textAlign: 'center',
  },
  largeBtn: {
    minHeight: 52,
    width: '100%',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  successBtn: {
    marginTop: 4,
    backgroundColor: '#DCF4E7',
    borderColor: '#B8E8CB',
  },
  warningBtn: {
    backgroundColor: '#FFF2DE',
    borderColor: '#F7D9A9',
  },
  skipBtn: {
    backgroundColor: '#FCEBEB',
    borderColor: '#F5C6C8',
  },
  successText: {
    color: '#126E48',
    fontWeight: '800',
    fontSize: 16,
  },
  warningText: {
    color: '#A35D00',
    fontWeight: '800',
    fontSize: 16,
  },
  skipText: {
    color: '#B9404D',
    fontWeight: '800',
    fontSize: 16,
  },
  toast: {
    alignSelf: 'center',
    borderRadius: 999,
    backgroundColor: '#163A6B',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  toastText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(6, 18, 34, 0.5)',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  reasonCard: {
    gap: 9,
  },
  reasonTitle: {
    color: MedsTheme.colors.textMain,
    fontSize: 18,
    fontWeight: '800',
  },
  reasonRow: {
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: MedsTheme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
  },
  reasonText: {
    color: MedsTheme.colors.textMain,
    fontWeight: '600',
  },
  closeBtn: {
    alignItems: 'center',
    paddingTop: 2,
  },
  closeText: {
    color: MedsTheme.colors.primaryDark,
    fontWeight: '700',
  },
});
