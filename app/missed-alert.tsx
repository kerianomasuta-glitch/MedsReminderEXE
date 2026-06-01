import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ActionButton, AppScreen, PageHeader, SectionCard } from '@/components/meds/ui-kit';
import { MedsTheme } from '@/constants/meds-theme';

export default function MissedAlertScreen() {
  return (
    <AppScreen>
      <PageHeader title="Cảnh báo quên thuốc" subtitle="Bạn chưa xác nhận uống thuốc sau thời gian nhắc." />

      <SectionCard style={styles.alertCard}>
        <Text style={styles.alertTitle}>Bạn chưa xác nhận uống thuốc</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Tên thuốc:</Text>
          <Text style={styles.value}>Thuốc huyết áp</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Giờ cần uống:</Text>
          <Text style={styles.value}>06:00 PM</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Trễ:</Text>
          <Text style={[styles.value, styles.lateValue]}>25 phút</Text>
        </View>
      </SectionCard>

      <ActionButton label="Đã uống" tone="success" />
      <ActionButton label="Nhắc lại" tone="warning" />
      <ActionButton label="Bỏ qua" tone="danger" />

      <Pressable style={styles.noticeCard}>
        <Text style={styles.noticeText}>
          Cảnh báo sẽ được gửi cho người thân sau 15 phút nếu bạn chưa xác nhận.
        </Text>
      </Pressable>
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
