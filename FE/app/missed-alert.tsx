import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FeedbackToast } from '@/components/meds/feedback-toast';
import { ActionButton, AppScreen, PageHeader, SectionCard } from '@/components/meds/ui-kit';
import { missedAlertMock } from '@/constants/app-mock';
import { MedsTheme } from '@/constants/meds-theme';

export default function MissedAlertScreen() {
  const [statusText, setStatusText] = useState<string | null>(null);

  return (
    <AppScreen>
      <PageHeader title="Cảnh báo quên thuốc" subtitle="Bạn chưa xác nhận uống thuốc sau thời gian nhắc." />

      <SectionCard style={styles.alertCard}>
        <Text style={styles.alertTitle}>Bạn chưa xác nhận uống thuốc</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Tên thuốc:</Text>
          <Text style={styles.value}>{missedAlertMock.medicineName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Giờ cần uống:</Text>
          <Text style={styles.value}>{missedAlertMock.dueTime}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Trễ:</Text>
          <Text style={[styles.value, styles.lateValue]}>{missedAlertMock.lateDuration}</Text>
        </View>
      </SectionCard>

      <ActionButton label="Đã uống" tone="success" onPress={() => setStatusText('Đã xác nhận uống thuốc cho lịch này.')} />
      <ActionButton label="Nhắc lại" tone="warning" onPress={() => setStatusText('Đã đặt nhắc lại sau 15 phút.')} />
      <ActionButton label="Bỏ qua" tone="danger" onPress={() => setStatusText('Đã ghi nhận bỏ qua liều thuốc.')} />

      <Pressable style={styles.noticeCard}>
        <Text style={styles.noticeText}>{missedAlertMock.caregiverNotice}</Text>
      </Pressable>
      <FeedbackToast message={statusText} onHide={() => setStatusText(null)} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  alertCard: {
    backgroundColor: '#FFF0F1',
    borderColor: '#F8CBCD',
    gap: 8,
  },
  alertTitle: {
    color: '#B73542',
    fontSize: 24,
    fontWeight: '800',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  label: {
    width: 105,
    color: '#5F6E84',
    fontWeight: '600',
  },
  value: {
    flex: 1,
    color: MedsTheme.colors.textMain,
    fontWeight: '700',
  },
  lateValue: {
    color: '#B64B00',
  },
  noticeCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MedsTheme.colors.border,
    backgroundColor: '#FFFFFF',
    padding: 12,
  },
  noticeText: {
    color: MedsTheme.colors.textMuted,
    lineHeight: 20,
  },
});
