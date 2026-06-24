import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ActionButton, AppScreen, PageHeader, SectionCard } from '@/components/meds/ui-kit';
import { MedsTheme } from '@/constants/meds-theme';
import { useAppointments } from '@/store/appointments-store';

export default function AppointmentsScreen() {
  const appointments = useAppointments();

  return (
    <AppScreen>
      <PageHeader title="Lịch tái khám" subtitle="Theo dõi các lịch khám sắp tới và trạng thái thực hiện." />

      {appointments.map((item) => (
        <Pressable
          key={item.id}
          onPress={() =>
            router.push({
              pathname: '/appointments/[id]/edit',
              params: { id: item.id },
            })
          }>
          <SectionCard>
            <View style={styles.rowBetween}>
              <Text style={styles.title}>{item.title}</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>
            <Text style={styles.meta}>{item.hospital}</Text>
            <Text style={styles.meta}>{item.doctor}</Text>
            <Text style={styles.meta}>
              {item.date} - {item.time}
            </Text>
            <Text style={styles.note}>{item.note}</Text>
          </SectionCard>
        </Pressable>
      ))}

      <ActionButton
        label="Thêm lịch khám"
        icon={<Ionicons name="add-circle" size={18} color="#FFFFFF" />}
        onPress={() => router.push('/appointments/new')}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    flex: 1,
    color: MedsTheme.colors.textMain,
    fontSize: 18,
    fontWeight: '800',
  },
  statusBadge: {
    borderRadius: 999,
    backgroundColor: '#EAF3FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: MedsTheme.colors.primaryDark,
    fontSize: 12,
    fontWeight: '700',
  },
  meta: {
    color: MedsTheme.colors.textMuted,
    fontSize: 14,
  },
  note: {
    color: MedsTheme.colors.textMain,
    fontSize: 14,
  },
});
