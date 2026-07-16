import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { DepthButton, DepthCard, StaggerIn } from '@/components/meds/depth-ui';
import { FeedbackToast } from '@/components/meds/feedback-toast';
import { DepthChip, SectionLabel, StatTile, SubScreen, SubScreenIntro } from '@/components/meds/sub-screen-ui';
import { medicineMock, reportChartValues, reportMock } from '@/constants/app-mock';
import { MedsTheme } from '@/constants/meds-theme';

const { colors, typography, radius, spacing, fonts } = MedsTheme;

const TABS = ['Ngày', 'Tuần', 'Tháng'] as const;

export default function ReportsScreen() {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Tuần');
  const [filter, setFilter] = useState('Tất cả');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const maxBar = Math.max(...reportChartValues, 1);

  return (
    <SubScreen paddedBottom={40}>
      <Stack.Screen options={{ headerStyle: { backgroundColor: colors.canvasSoft } }} />
      <SubScreenIntro subtitle="Theo dõi mức độ tuân thủ theo ngày, tuần hoặc tháng." />

      <StaggerIn index={0}>
        <DepthCard style={styles.card}>
          <View style={styles.tabRow}>
            {TABS.map((item) => (
              <DepthChip key={item} label={item} active={tab === item} onPress={() => setTab(item)} />
            ))}
          </View>
        </DepthCard>
      </StaggerIn>

      <StaggerIn index={1}>
        <DepthCard style={styles.card}>
          <SectionLabel text="TỔNG QUAN" />
          <View style={styles.statsRow}>
            <StatTile label="Tuân thủ" value={`${reportMock.weeklyPercent}%`} tone="brand" />
            <StatTile label="Đúng giờ" value={`${reportMock.onTime}`} tone="success" />
            <StatTile label="Trễ giờ" value={`${reportMock.late}`} tone="warning" />
            <StatTile label="Bỏ qua" value={`${reportMock.missed}`} tone="danger" />
          </View>
        </DepthCard>
      </StaggerIn>

      <StaggerIn index={2}>
        <DepthCard style={styles.card}>
          <SectionLabel text="BIỂU ĐỒ TUÂN THỦ" />
          <View style={styles.chartBox}>
            {reportChartValues.map((value, idx) => {
              const height = Math.max(24, (value / maxBar) * 96);
              return (
                <View key={`${value}-${idx}`} style={styles.barWrap}>
                  <LinearGradient
                    colors={[colors.brandNameLight, colors.brandName]}
                    style={[styles.bar, { height }]}
                  />
                  <Text style={styles.barLabel}>{idx + 1}</Text>
                </View>
              );
            })}
          </View>
        </DepthCard>
      </StaggerIn>

      <StaggerIn index={3}>
        <DepthCard style={styles.card}>
          <SectionLabel text="PHÂN TÍCH THEO THUỐC" />
          <View style={styles.filterRow}>
            {['Tất cả', ...medicineMock.map((item) => item.name)].map((name) => (
              <DepthChip key={name} label={name} active={filter === name} onPress={() => setFilter(name)} />
            ))}
          </View>

          {medicineMock.map((item) => (
            <View key={item.id} style={styles.breakdownRow}>
              <View style={styles.breakdownHead}>
                <View style={styles.breakdownIcon}>
                  <Ionicons name="medkit-outline" size={16} color={colors.brandName} />
                </View>
                <Text style={styles.breakdownName}>{item.name}</Text>
              </View>
              <View style={styles.breakdownStats}>
                <Text style={styles.breakdownStatGood}>
                  Đúng giờ: {item.status === 'missed' ? '70%' : '95%'}
                </Text>
                <Text style={styles.breakdownStatBad}>Bỏ qua: {item.status === 'missed' ? 1 : 0}</Text>
              </View>
            </View>
          ))}
        </DepthCard>
      </StaggerIn>

      <StaggerIn index={4}>
        <DepthCard style={styles.card}>
          <SectionLabel text="TIMELINE CHI TIẾT" />
          {reportMock.timeline.map((item, index) => (
            <View
              key={`${item.time}-${item.event}`}
              style={[styles.timelineRow, index < reportMock.timeline.length - 1 && styles.timelineBorder]}>
              <Text style={styles.timelineTime}>{item.time}</Text>
              <View style={styles.timelineDot} />
              <Text style={styles.timelineText}>{item.event}</Text>
            </View>
          ))}
        </DepthCard>
      </StaggerIn>

      <DepthButton
        label="Xuất báo cáo"
        tone="brand"
        icon={<Ionicons name="download-outline" size={18} color={colors.onPrimary} />}
        onPress={() => setActionMessage('Đã xuất báo cáo mẫu thành công.')}
      />
      <DepthButton
        label="Chia sẻ với người thân"
        icon={<Ionicons name="share-social-outline" size={18} color={colors.brandName} />}
        onPress={() => setActionMessage('Đã chia sẻ báo cáo mẫu cho người thân.')}
      />
      <FeedbackToast message={actionMessage} tone="info" onHide={() => setActionMessage(null)} />
    </SubScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.base,
    gap: spacing.sm,
  },
  tabRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    justifyContent: 'space-between',
  },
  chartBox: {
    minHeight: 130,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.canvasSoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  barWrap: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  bar: {
    width: '72%',
    maxWidth: 28,
    borderRadius: radius.sm,
    minHeight: 24,
  },
  barLabel: {
    ...typography.caption,
    fontFamily: fonts.sans,
    color: colors.muted,
    fontSize: 11,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  breakdownRow: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.hairlineStrong,
    backgroundColor: colors.canvasSoft,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  breakdownHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  breakdownIcon: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    backgroundColor: colors.brandNameSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breakdownName: {
    ...typography.titleSm,
    fontFamily: fonts.sansSemiBold,
    color: colors.ink,
  },
  breakdownStats: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingLeft: 38,
  },
  breakdownStatGood: {
    ...typography.caption,
    fontFamily: fonts.sansMedium,
    color: colors.semanticSuccess,
  },
  breakdownStatBad: {
    ...typography.caption,
    fontFamily: fonts.sansMedium,
    color: colors.critical,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  timelineBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  timelineTime: {
    width: 44,
    ...typography.caption,
    fontFamily: fonts.sansSemiBold,
    color: colors.brandName,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brandName,
    marginTop: 5,
  },
  timelineText: {
    flex: 1,
    ...typography.bodySm,
    fontFamily: fonts.sans,
    color: colors.ink,
    lineHeight: 20,
  },
});
