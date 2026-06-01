import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ActionButton, AppScreen, ChoiceChip, PageHeader, SectionCard } from '@/components/meds/ui-kit';
import { medicineMock, reportMock } from '@/constants/app-mock';
import { MedsTheme } from '@/constants/meds-theme';

export default function ReportsScreen() {
  const [tab, setTab] = useState<'Ngày' | 'Tuần' | 'Tháng'>('Tuần');
  const [filter, setFilter] = useState('Tất cả');

  return (
    <AppScreen>
      <PageHeader title="Báo cáo tuân thủ" subtitle="Theo dõi mức độ tuân thủ theo ngày, tuần hoặc tháng." />

      <SectionCard>
        <View style={styles.tabRow}>
          {(['Ngày', 'Tuần', 'Tháng'] as const).map((item) => (
            <ChoiceChip key={item} label={item} active={tab === item} onPress={() => setTab(item)} />
          ))}
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Tổng quan</Text>
        <View style={styles.statsRow}>
          <ReportStat label="Tuân thủ" value={`${reportMock.weeklyPercent}%`} />
          <ReportStat label="Đúng giờ" value={`${reportMock.onTime}`} />
          <ReportStat label="Trễ giờ" value={`${reportMock.late}`} />
          <ReportStat label="Bỏ qua" value={`${reportMock.missed}`} />
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Biểu đồ đơn giản</Text>
        <View style={styles.chartRow}>
          {[70, 88, 80, 92, 76, 85, 81].map((value, idx) => (
            <View key={`${value}-${idx}`} style={styles.barWrap}>
              <View style={[styles.bar, { height: Math.max(28, value) }]} />
              <Text style={styles.barLabel}>{idx + 1}</Text>
            </View>
          ))}
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Phân tích theo thuốc</Text>
        <View style={styles.filterRow}>
          {['Tất cả', ...medicineMock.map((item) => item.name)].map((name) => (
            <ChoiceChip key={name} label={name} active={filter === name} onPress={() => setFilter(name)} />
          ))}
        </View>

        {medicineMock.map((item) => (
          <View key={item.id} style={styles.breakdownRow}>
            <Text style={styles.breakdownName}>{item.name}</Text>
            <Text style={styles.breakdownStat}>Đúng giờ: {item.status === 'missed' ? '70%' : '95%'}</Text>
            <Text style={styles.breakdownStat}>Bỏ qua: {item.status === 'missed' ? 1 : 0}</Text>
          </View>
        ))}
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Timeline chi tiết</Text>
        {reportMock.timeline.map((item) => (
          <View key={`${item.time}-${item.event}`} style={styles.timelineRow}>
            <Text style={styles.timelineTime}>{item.time}</Text>
            <Text style={styles.timelineText}>{item.event}</Text>
          </View>
        ))}
      </SectionCard>

      <ActionButton label="Xuất báo cáo" />
      <ActionButton label="Chia sẻ với người thân" tone="secondary" />
    </AppScreen>
  );
}

function ReportStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tabRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sectionTitle: {
    color: MedsTheme.colors.textMain,
    fontSize: 19,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statCard: {
    width: '48.5%',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: MedsTheme.colors.border,
    backgroundColor: '#F8FBFF',
    paddingVertical: 11,
    alignItems: 'center',
  },
  statValue: {
    color: MedsTheme.colors.primaryDark,
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    color: MedsTheme.colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  chartRow: {
    minHeight: 120,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: MedsTheme.colors.border,
    backgroundColor: '#FFFFFF',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  barWrap: {
    alignItems: 'center',
    gap: 6,
  },
  bar: {
    width: 22,
    borderRadius: 5,
    backgroundColor: MedsTheme.colors.primary,
  },
  barLabel: {
    fontSize: 11,
    color: MedsTheme.colors.textMuted,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  breakdownRow: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: MedsTheme.colors.border,
    padding: 10,
    gap: 2,
  },
  breakdownName: {
    color: MedsTheme.colors.textMain,
    fontWeight: '700',
  },
  breakdownStat: {
    color: MedsTheme.colors.textMuted,
    fontSize: 13,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 10,
  },
  timelineTime: {
    width: 44,
    color: MedsTheme.colors.primaryDark,
    fontWeight: '700',
  },
  timelineText: {
    flex: 1,
    color: MedsTheme.colors.textMain,
  },
});
