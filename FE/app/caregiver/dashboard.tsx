import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ActionButton, AppScreen, PageHeader, SectionCard } from '@/components/meds/ui-kit';
import { medicineMock, reportMock, userMock } from '@/constants/app-mock';
import { MedsTheme } from '@/constants/meds-theme';

export default function CaregiverDashboardScreen() {
  return (
    <AppScreen>
      <PageHeader title="Theo dõi người thân" subtitle="Theo dõi trạng thái uống thuốc hằng ngày của người thân." />

      <SectionCard>
        <Text style={styles.patientName}>{userMock.name}</Text>
        <Text style={styles.patientMeta}>{userMock.age} tuổi - Tình trạng hôm nay: Ổn định</Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Today Medication Status</Text>
        <View style={styles.statsRow}>
          <StatBox label="Đã uống" value="2" tone="#E4F4EC" />
          <StatBox label="Sắp tới" value="1" tone="#E7F1FF" />
          <StatBox label="Bỏ qua" value="1" tone="#FCEDEF" />
          <StatBox label="Trễ giờ" value="1" tone="#FFF2DF" />
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Thuốc hôm nay</Text>
        {medicineMock.map((item) => (
          <View key={item.id} style={styles.medicineRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="medical" size={14} color={MedsTheme.colors.primaryDark} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.medicineName}>{item.name}</Text>
              <Text style={styles.medicineMeta}>{item.time} - {item.dose}</Text>
            </View>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        ))}
      </SectionCard>

      <SectionCard style={styles.alertCard}>
        <Text style={styles.alertTitle}>Cảnh báo nổi bật</Text>
        <Text style={styles.alertText}>Thuốc huyết áp chưa được xác nhận lúc 06:00 PM.</Text>
      </SectionCard>

      <View style={styles.actionRow}>
        <ActionButton label="Gọi nhắc nhở" tone="warning" onPress={() => router.push('/reminder')} />
        <ActionButton label="Gửi lời nhắn" tone="secondary" onPress={() => router.push('/ai-assistant')} />
      </View>

      <SectionCard>
        <Text style={styles.sectionTitle}>Tuân thủ tuần này</Text>
        <Text style={styles.percent}>{reportMock.weeklyPercent}%</Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Cảnh báo gần đây</Text>
        <Pressable style={styles.timelineRow} onPress={() => router.push('/missed-alert')}>
          <Text style={styles.timelineTime}>18:25</Text>
          <Text style={styles.timelineText}>Thuốc huyết áp - chưa xác nhận</Text>
        </Pressable>
      </SectionCard>
    </AppScreen>
  );
}

function StatBox({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <View style={[styles.statBox, { backgroundColor: tone }]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  patientName: {
    fontSize: 21,
    fontWeight: '800',
    color: MedsTheme.colors.textMain,
  },
  patientMeta: {
    marginTop: 2,
    color: MedsTheme.colors.textMuted,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: MedsTheme.colors.textMain,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statBox: {
    width: '48.5%',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDE6F3',
  },
  statValue: {
    color: MedsTheme.colors.textMain,
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    color: MedsTheme.colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  medicineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 46,
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  medicineName: {
    color: MedsTheme.colors.textMain,
    fontWeight: '700',
  },
  medicineMeta: {
    color: MedsTheme.colors.textMuted,
    fontSize: 12,
  },
  statusText: {
    color: MedsTheme.colors.primaryDark,
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  alertCard: {
    backgroundColor: '#FFF0F1',
    borderColor: '#F8CCCF',
  },
  alertTitle: {
    color: '#A92F3F',
    fontSize: 18,
    fontWeight: '800',
  },
  alertText: {
    color: '#8C4451',
  },
  actionRow: {
    gap: 8,
  },
  percent: {
    fontSize: 40,
    fontWeight: '800',
    color: MedsTheme.colors.primaryDark,
  },
  timelineRow: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: MedsTheme.colors.border,
    padding: 10,
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
