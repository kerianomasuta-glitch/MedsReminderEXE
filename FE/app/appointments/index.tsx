import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { router, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { DepthButton, DepthCard, DepthPressable, StaggerIn } from '@/components/meds/depth-ui';
import { SubScreen, SubScreenIntro } from '@/components/meds/sub-screen-ui';
import { MedsTheme } from '@/constants/meds-theme';
import { useAppointments } from '@/store/appointments-store';

const { colors, typography, radius, spacing, fonts } = MedsTheme;

function AppointmentCard({
  title,
  hospital,
  doctor,
  date,
  time,
  note,
  status,
  onPress,
}: {
  title: string;
  hospital: string;
  doctor: string;
  date: string;
  time: string;
  note: string;
  status: string;
  onPress?: () => void;
}) {
  return (
    <DepthPressable depth="sm" onPress={onPress}>
      <DepthCard style={styles.card}>
        <View style={styles.cardAccent} />
        <View style={styles.cardTop}>
          <View style={styles.iconWrap}>
            <Ionicons name="medkit" size={20} color={colors.brandName} />
          </View>
          <View style={styles.titleWrap}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{status}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.muted} />
        </View>

        <View style={styles.metaList}>
          <MetaRow icon="business-outline" text={hospital} />
          <MetaRow icon="person-outline" text={doctor} />
          <MetaRow icon="calendar-outline" text={`${date} · ${time}`} />
        </View>

        {note ? (
          <View style={styles.noteBox}>
            <Ionicons name="document-text-outline" size={14} color={colors.brandName} />
            <Text style={styles.note}>{note}</Text>
          </View>
        ) : null}
      </DepthCard>
    </DepthPressable>
  );
}

function MetaRow({ icon, text }: { icon: ComponentProps<typeof Ionicons>['name']; text: string }) {
  return (
    <View style={styles.metaRow}>
      <Ionicons name={icon} size={14} color={colors.muted} />
      <Text style={styles.meta}>{text}</Text>
    </View>
  );
}

export default function AppointmentsScreen() {
  const appointments = useAppointments();

  return (
    <SubScreen>
      <Stack.Screen options={{ headerStyle: { backgroundColor: colors.canvasSoft } }} />
      <SubScreenIntro subtitle="Theo dõi các lịch khám sắp tới và trạng thái thực hiện." />

      {appointments.length === 0 ? (
        <DepthCard style={styles.emptyCard}>
          <Ionicons name="calendar-outline" size={32} color={colors.muted} />
          <Text style={styles.emptyTitle}>Chưa có lịch tái khám</Text>
          <Text style={styles.emptyText}>Thêm lịch khám để được nhắc đúng hạn.</Text>
        </DepthCard>
      ) : (
        appointments.map((item, index) => (
          <StaggerIn key={item.id} index={index}>
            <AppointmentCard
              title={item.title}
              hospital={item.hospital}
              doctor={item.doctor}
              date={item.date}
              time={item.time}
              note={item.note}
              status={item.status}
              onPress={() =>
                router.push({
                  pathname: '/appointments/[id]/edit',
                  params: { id: item.id },
                })
              }
            />
          </StaggerIn>
        ))
      )}

      <DepthButton
        label="Thêm lịch khám"
        tone="brand"
        icon={<Ionicons name="add" size={18} color={colors.onPrimary} />}
        onPress={() => router.push('/appointments/new')}
      />
    </SubScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.base,
    gap: spacing.sm,
    overflow: 'hidden',
  },
  cardAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: colors.brandName,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingLeft: 4,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.brandNameSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(27, 61, 110, 0.1)',
  },
  titleWrap: {
    flex: 1,
    gap: 6,
  },
  title: {
    ...typography.titleSm,
    fontFamily: fonts.sansSemiBold,
    color: colors.ink,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.brandNameSoft,
  },
  statusText: {
    ...typography.caption,
    fontFamily: fonts.sansSemiBold,
    color: colors.brandName,
    fontSize: 11,
  },
  metaList: {
    gap: 6,
    paddingLeft: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  meta: {
    ...typography.bodySm,
    fontFamily: fonts.sans,
    color: colors.body,
    flex: 1,
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.canvasSoft,
    marginLeft: 4,
  },
  note: {
    flex: 1,
    ...typography.caption,
    fontFamily: fonts.sans,
    color: colors.body,
    lineHeight: 18,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.base,
    gap: spacing.xs,
  },
  emptyTitle: {
    ...typography.titleSm,
    fontFamily: fonts.sansSemiBold,
    color: colors.ink,
  },
  emptyText: {
    ...typography.bodySm,
    fontFamily: fonts.sans,
    color: colors.body,
    textAlign: 'center',
  },
});
