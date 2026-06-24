import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FeedbackToast } from '@/components/meds/feedback-toast';
import { MedsTheme } from '@/constants/meds-theme';

const medicationNameById: Record<string, { name: string; subtitle: string }> = {
  'paracetamol-500': { name: 'Paracetamol 500mg', subtitle: 'Thuốc giảm đau (Ngày 1 viên)' },
  'vitamin-c': { name: 'Vitamin C', subtitle: 'Bổ sung đề kháng (Ngày 1 viên)' },
  'bao-thanh-syrup': { name: 'Siro ho Bảo Thanh', subtitle: 'Syrup ho (Ngày 2 lần)' },
  'huyet-ap': { name: 'Amlodipine 5mg', subtitle: 'Thuốc huyết áp (Ngày 1 viên)' },
  amlodipine: { name: 'Amlodipine 5mg', subtitle: 'Thuốc huyết áp (Ngày 1 viên)' },
  'new-medication': { name: 'Thuốc mới', subtitle: 'Điền thông tin chi tiết cho thuốc' },
  'omega-3': { name: 'Omega 3', subtitle: 'Bổ sung tim mạch (Ngày 1 viên)' },
};

export default function MedicationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const display = medicationNameById[id] ?? medicationNameById['new-medication'];
  const [feedbackText, setFeedbackText] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable
              hitSlop={10}
              onPress={() =>
                router.push({
                  pathname: '/medicines/[id]/edit',
                  params: { id },
                })
              }>
              <Ionicons name="create-outline" size={20} color={MedsTheme.colors.textMain} />
            </Pressable>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroWrap}>
          <View style={styles.heroOuter}>
            <View style={styles.heroInner}>
              <Ionicons name="medical" size={44} color="#B9C6D8" />
            </View>
          </View>

          <View style={styles.tagRow}>
            <View style={styles.tagPrimary}>
              <Text style={styles.tagPrimaryText}>Viên nén</Text>
            </View>
            <View style={styles.tagSecondary}>
              <Text style={styles.tagSecondaryText}>Sau ăn</Text>
            </View>
          </View>

          <Text style={styles.title}>{display.name}</Text>
          <Text style={styles.subtitle}>{display.subtitle}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Lịch uống trong ngày</Text>
          <View style={styles.periodRow}>
            <View style={styles.periodBox}>
              <Text style={styles.periodLabel}>Sáng</Text>
            </View>
            <View style={[styles.periodBox, styles.periodBoxActive]}>
              <Text style={[styles.periodLabel, styles.periodLabelActive]}>Trưa</Text>
              <Text style={styles.periodTime}>12:00</Text>
            </View>
            <View style={styles.periodBox}>
              <Text style={styles.periodLabel}>Tối</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Hướng dẫn sử dụng</Text>

          <View style={styles.guideRow}>
            <View style={styles.guideIcon}>
              <Ionicons name="restaurant-outline" size={15} color={MedsTheme.colors.primaryDark} />
            </View>
            <View style={styles.guideContent}>
              <Text style={styles.guideMain}>Uống sau khi ăn</Text>
              <Text style={styles.guideSub}>Đợi khoảng 30 phút sau bữa ăn chính để thuốc hấp thụ tốt nhất.</Text>
            </View>
          </View>

          <View style={styles.guideRow}>
            <View style={styles.guideIcon}>
              <Ionicons name="water-outline" size={15} color={MedsTheme.colors.primaryDark} />
            </View>
            <View style={styles.guideContent}>
              <Text style={styles.guideMain}>Uống với nhiều nước</Text>
              <Text style={styles.guideSub}>Sử dụng ít nhất một cốc nước lọc đầy khi uống.</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={styles.remindButton}
          onPress={() => setFeedbackText('Đã đặt nhắc lại sau 15 phút cho thuốc này.')}>
          <Ionicons name="time-outline" size={16} color={MedsTheme.colors.primaryDark} />
          <Text style={styles.remindText}>Nhắc lại sau 15p</Text>
        </Pressable>

        <Pressable
          style={styles.confirmButton}
          onPress={() => setFeedbackText('Đã xác nhận uống thuốc thành công.')}>
          <Ionicons name="checkmark" size={18} color="#FFFFFF" />
          <Text style={styles.confirmText}>Đã uống</Text>
        </Pressable>
        <FeedbackToast message={feedbackText} onHide={() => setFeedbackText(null)} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: MedsTheme.colors.appBackground,
  },
  content: {
    padding: 16,
    gap: 12,
    paddingBottom: 28,
  },
  heroWrap: {
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 6,
  },
  heroOuter: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 2,
    borderColor: '#E0E8F4',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FBFF',
  },
  heroInner: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#D2DCEB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  tagPrimary: {
    backgroundColor: '#0C2A54',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagPrimaryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  tagSecondary: {
    backgroundColor: '#FFDEA8',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagSecondaryText: {
    color: '#764B00',
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    marginTop: 10,
    fontSize: 35,
    fontWeight: '800',
    color: MedsTheme.colors.textMain,
  },
  subtitle: {
    marginTop: 2,
    color: MedsTheme.colors.textMuted,
    fontSize: 15,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: MedsTheme.colors.border,
    backgroundColor: MedsTheme.colors.card,
    padding: 14,
    gap: 12,
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: MedsTheme.colors.textMain,
  },
  periodRow: {
    flexDirection: 'row',
    gap: 8,
  },
  periodBox: {
    flex: 1,
    minHeight: 64,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: MedsTheme.colors.border,
    backgroundColor: '#F4F7FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodBoxActive: {
    borderColor: '#5EA6FA',
    backgroundColor: '#2B8EFF',
  },
  periodLabel: {
    color: MedsTheme.colors.textMuted,
    fontWeight: '700',
  },
  periodLabelActive: {
    color: '#D8EBFF',
  },
  periodTime: {
    marginTop: 2,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  guideRow: {
    flexDirection: 'row',
    gap: 10,
  },
  guideIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  guideContent: {
    flex: 1,
  },
  guideMain: {
    color: MedsTheme.colors.textMain,
    fontWeight: '700',
    marginBottom: 2,
  },
  guideSub: {
    color: MedsTheme.colors.textMuted,
    lineHeight: 19,
    fontSize: 13,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#DCE5F3',
    backgroundColor: MedsTheme.colors.pageBackground,
    gap: 10,
  },
  remindButton: {
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D3E4FF',
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  remindText: {
    color: MedsTheme.colors.primaryDark,
    fontWeight: '600',
  },
  confirmButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: MedsTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
