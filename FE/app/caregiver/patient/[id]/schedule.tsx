import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AppAlert } from '@/components/meds/app-alert';
import { EmptyState, FloatingAddButton, ListItemCard, SectionHeader } from '@/components/meds/caregiver-ui';
import { ActionButton, AppScreen, SectionCard } from '@/components/meds/ui-kit';
import { MedsTheme } from '@/constants/meds-theme';
import {
  deleteScheduleApi,
  formatScheduleFrequency,
  getScheduleErrorMessage,
  getSchedulesByPatientApi,
  resolvePrescriptionTitle,
  type ScheduleSummary,
} from '@/services/schedule-api';
import { useAuth } from '@/store/auth-store';

type AlertState = {
  title: string;
  message: string;
  tone?: 'success' | 'warning' | 'error';
  cancelLabel?: string;
  confirmLabel?: string;
  onConfirm?: () => void;
};

export default function CaregiverPatientScheduleScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const { accessToken } = useAuth();
  const [schedules, setSchedules] = useState<ScheduleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [alert, setAlert] = useState<AlertState | null>(null);

  const patientName = name?.trim() || 'Bệnh nhân';

  const loadSchedules = useCallback(async () => {
    if (!accessToken || !id) {
      setSchedules([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await getSchedulesByPatientApi(id, accessToken, { page: 1, limit: 20 });
      setSchedules(response.data.schedules ?? []);
    } catch (err: unknown) {
      setError(getScheduleErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [accessToken, id]);

  useFocusEffect(
    useCallback(() => {
      void loadSchedules();
    }, [loadSchedules]),
  );

  const handleDeleteSchedule = (item: ScheduleSummary) => {
    setAlert({
      title: 'Xóa lịch uống thuốc',
      message: `Bạn có chắc muốn xóa lịch "${resolvePrescriptionTitle(item.prescriptionId)}"?`,
      tone: 'warning',
      cancelLabel: 'Hủy',
      confirmLabel: 'Xóa',
      onConfirm: () => void performDelete(item._id),
    });
  };

  const performDelete = async (scheduleId: string) => {
    if (!accessToken) return;
    try {
      setDeletingId(scheduleId);
      await deleteScheduleApi(scheduleId, accessToken);
      setSchedules((prev) => prev.filter((item) => item._id !== scheduleId));
      setAlert({
        title: 'Đã xóa',
        message: 'Lịch uống thuốc đã được xóa.',
        tone: 'success',
      });
    } catch (err) {
      setAlert({
        title: 'Không xóa được',
        message: getScheduleErrorMessage(err),
        tone: 'error',
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AppScreen hero paddedBottom={40}>
      <Stack.Screen options={{ title: 'Lịch uống thuốc', headerShadowVisible: false }} />

      <View style={styles.heroText}>
        <Text style={styles.heroTitle}>Lịch uống thuốc</Text>
        <Text style={styles.heroSubtitle}>Bệnh nhân: {patientName}</Text>
      </View>

      <FloatingAddButton
        label="Thêm lịch từ đơn thuốc"
        onPress={() => router.push({ pathname: '/medicines/new', params: { patientId: id, patientName } })}
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={MedsTheme.colors.ink} />
          <Text style={styles.meta}>Đang tải lịch uống thuốc...</Text>
        </View>
      ) : error ? (
        <SectionCard>
          <Text style={styles.error}>{error}</Text>
          <ActionButton label="Thử lại" tone="secondary" onPress={() => void loadSchedules()} />
        </SectionCard>
      ) : schedules.length === 0 ? (
        <SectionCard>
          <EmptyState
            icon="calendar-outline"
            title="Chưa có lịch uống thuốc"
            message="Tạo lịch nhắc nhở để bệnh nhân không bỏ lỡ liều thuốc."
            accent={MedsTheme.colors.semanticSuccess}
            accentSoft="#ECFDF3"
          />
        </SectionCard>
      ) : (
        <View style={styles.listSection}>
          <SectionHeader title={`${schedules.length} lịch đang quản lý`} icon="time-outline" />
          {schedules.map((item) => {
            const timeLabel = item.timeSlots?.map((slot) => slot.time).join(' · ') || 'Chưa có khung giờ';
            const dateRange = `${item.startDate ? new Date(item.startDate).toLocaleDateString('vi-VN') : '—'} → ${item.endDate ? new Date(item.endDate).toLocaleDateString('vi-VN') : 'Không giới hạn'}`;

            return (
              <ListItemCard
                key={item._id}
                title={resolvePrescriptionTitle(item.prescriptionId)}
                lines={[formatScheduleFrequency(item.frequencyType), timeLabel, dateRange]}
                icon="calendar"
                accent={MedsTheme.colors.semanticSuccess}
                accentSoft="#ECFDF3"
                badge={{
                  label: item.isActive ? 'Đang hoạt động' : 'Tạm dừng',
                  tone: item.isActive ? 'success' : 'muted',
                }}
                onPress={() =>
                  router.push({
                    pathname: '/caregiver/patient/[id]/schedule/[scheduleId]',
                    params: { id, scheduleId: item._id, name: patientName },
                  })
                }
                onDelete={deletingId === item._id ? undefined : () => handleDeleteSchedule(item)}
              />
            );
          })}
        </View>
      )}

      <AppAlert
        visible={Boolean(alert)}
        title={alert?.title ?? ''}
        message={alert?.message ?? ''}
        tone={alert?.tone}
        cancelLabel={alert?.cancelLabel}
        confirmLabel={alert?.confirmLabel}
        onConfirm={alert?.onConfirm}
        onClose={() => setAlert(null)}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  heroText: {
    marginBottom: MedsTheme.spacing.xxs,
  },
  heroTitle: {
    fontSize: 28,
    fontFamily: MedsTheme.fonts.sansSemiBold,
    color: MedsTheme.colors.ink,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    marginTop: 4,
    fontSize: 14,
    fontFamily: MedsTheme.fonts.sans,
    color: MedsTheme.colors.body,
  },
  listSection: {
    gap: MedsTheme.spacing.sm,
  },
  center: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 10,
  },
  meta: {
    color: MedsTheme.colors.body,
    fontFamily: MedsTheme.fonts.sans,
    fontSize: 14,
  },
  error: {
    color: MedsTheme.colors.critical,
    fontFamily: MedsTheme.fonts.sansMedium,
    fontSize: 14,
  },
});
