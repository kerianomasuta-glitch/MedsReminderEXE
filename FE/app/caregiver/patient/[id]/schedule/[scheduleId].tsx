import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppAlert } from '@/components/meds/app-alert';
import { TimeSlotPicker } from '@/components/meds/time-slot-picker';
import { AppScreen, ChoiceChip, TextField } from '@/components/meds/ui-kit';
import { MedsTheme } from '@/constants/meds-theme';
import {
  formatDaysOfWeek,
  formatScheduleFrequency,
  getScheduleDetailApi,
  getScheduleErrorMessage,
  resolvePrescriptionTitle,
  toDateInputValue,
  updateScheduleApi,
  type ScheduleFrequencyType,
  type ScheduleSummary,
  type ScheduleTimeSlot,
} from '@/services/schedule-api';
import { useAuth } from '@/store/auth-store';

const FREQUENCY_OPTIONS: ScheduleFrequencyType[] = ['daily', 'weekly', 'interval', 'as_needed'];

const WEEKDAY_OPTIONS = [
  { value: 0, label: 'CN' },
  { value: 1, label: 'T2' },
  { value: 2, label: 'T3' },
  { value: 3, label: 'T4' },
  { value: 4, label: 'T5' },
  { value: 5, label: 'T6' },
  { value: 6, label: 'T7' },
] as const;

const REMINDER_MINUTE_OPTIONS = [0, 5, 10, 15, 30, 45, 60] as const;
const INTERVAL_DAY_OPTIONS = [1, 2, 3, 4, 5, 7, 10, 14] as const;

function formatDateRange(start?: string, end?: string) {
  const startLabel = start ? new Date(start).toLocaleDateString('vi-VN') : '—';
  const endLabel = end ? new Date(end).toLocaleDateString('vi-VN') : 'Không giới hạn';
  return `${startLabel} → ${endLabel}`;
}

function applyScheduleToForm(schedule: ScheduleSummary) {
  return {
    startDate: toDateInputValue(schedule.startDate),
    endDate: toDateInputValue(schedule.endDate),
    frequencyType: (schedule.frequencyType ?? 'daily') as ScheduleFrequencyType,
    timeSlots: schedule.timeSlots ?? [],
    selectedDaysOfWeek: schedule.daysOfWeek ?? [],
    intervalDays: schedule.intervalDays ?? 2,
    reminderMinutesBefore: schedule.reminderMinutesBefore ?? 5,
    isActive: schedule.isActive !== false,
  };
}

export default function CaregiverScheduleDetailScreen() {
  const { id: patientId, scheduleId, name } = useLocalSearchParams<{
    id: string;
    scheduleId: string;
    name?: string;
  }>();
  const { accessToken } = useAuth();

  const [schedule, setSchedule] = useState<ScheduleSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<{
    title: string;
    message: string;
    tone?: 'success' | 'warning' | 'error';
    onClose?: () => void;
  } | null>(null);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [frequencyType, setFrequencyType] = useState<ScheduleFrequencyType>('daily');
  const [timeSlots, setTimeSlots] = useState<ScheduleTimeSlot[]>([]);
  const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState<number[]>([]);
  const [intervalDays, setIntervalDays] = useState(2);
  const [reminderMinutesBefore, setReminderMinutesBefore] = useState(5);
  const [isActive, setIsActive] = useState(true);

  const patientName = name?.trim() || 'Bệnh nhân';

  const loadSchedule = useCallback(async () => {
    if (!accessToken || !scheduleId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await getScheduleDetailApi(scheduleId, accessToken);
      const data = response.data;
      setSchedule(data);
      const form = applyScheduleToForm(data);
      setStartDate(form.startDate);
      setEndDate(form.endDate);
      setFrequencyType(form.frequencyType);
      setTimeSlots(form.timeSlots);
      setSelectedDaysOfWeek(form.selectedDaysOfWeek);
      setIntervalDays(form.intervalDays);
      setReminderMinutesBefore(form.reminderMinutesBefore);
      setIsActive(form.isActive);
    } catch (err) {
      setError(getScheduleErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [accessToken, scheduleId]);

  useEffect(() => {
    void loadSchedule();
  }, [loadSchedule]);

  const toggleDayOfWeek = (day: number) => {
    setSelectedDaysOfWeek((prev) => {
      if (prev.includes(day)) {
        return prev.filter((item) => item !== day);
      }
      return [...prev, day].sort((a, b) => a - b);
    });
  };

  const handleCancelEdit = () => {
    if (!schedule) return;
    const form = applyScheduleToForm(schedule);
    setStartDate(form.startDate);
    setEndDate(form.endDate);
    setFrequencyType(form.frequencyType);
    setTimeSlots(form.timeSlots);
    setSelectedDaysOfWeek(form.selectedDaysOfWeek);
    setIntervalDays(form.intervalDays);
    setReminderMinutesBefore(form.reminderMinutesBefore);
    setIsActive(form.isActive);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!accessToken || !scheduleId) return;

    if (!timeSlots.length) {
      setAlert({ title: 'Thiếu thông tin', message: 'Cần ít nhất 1 khung giờ uống thuốc.', tone: 'warning' });
      return;
    }

    if (frequencyType === 'weekly' && selectedDaysOfWeek.length === 0) {
      setAlert({
        title: 'Thiếu thông tin',
        message: 'Chọn ít nhất 1 ngày trong tuần khi tần suất là hàng tuần.',
        tone: 'warning',
      });
      return;
    }

    try {
      setSaving(true);
      const response = await updateScheduleApi(
        scheduleId,
        {
          startDate,
          endDate: endDate.trim() || undefined,
          frequencyType,
          timeSlots,
          daysOfWeek: frequencyType === 'weekly' ? selectedDaysOfWeek : undefined,
          intervalDays: frequencyType === 'interval' ? intervalDays : undefined,
          reminderMinutesBefore,
          isActive,
        },
        accessToken,
      );
      setSchedule(response.data);
      setIsEditing(false);
      setAlert({
        title: 'Thành công',
        message: 'Cập nhật lịch uống thuốc thành công.',
        tone: 'success',
      });
    } catch (err) {
      setAlert({ title: 'Thất bại', message: getScheduleErrorMessage(err), tone: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppScreen hero paddedBottom={40}>
        <Stack.Screen options={{ title: 'Chi tiết lịch uống', headerShadowVisible: false }} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={MedsTheme.colors.ink} />
          <Text style={styles.meta}>Đang tải chi tiết lịch...</Text>
        </View>
      </AppScreen>
    );
  }

  if (error || !schedule) {
    return (
      <AppScreen hero paddedBottom={40}>
        <Stack.Screen options={{ title: 'Chi tiết lịch uống', headerShadowVisible: false }} />
        <View style={styles.card}>
          <Text style={styles.error}>{error ?? 'Không tìm thấy lịch uống thuốc.'}</Text>
          <Pressable style={styles.secondaryBtn} onPress={() => router.back()}>
            <Text style={styles.secondaryBtnText}>Quay lại</Text>
          </Pressable>
        </View>
      </AppScreen>
    );
  }

  const prescriptionTitle = resolvePrescriptionTitle(schedule.prescriptionId);
  const timeLabel = schedule.timeSlots?.map((slot) => slot.time).join(' · ') || '—';

  return (
    <AppScreen hero paddedBottom={44}>
      <Stack.Screen options={{ title: 'Chi tiết lịch uống', headerShadowVisible: false }} />

      <View style={styles.hero}>
        <Text style={styles.heroTitle}>{prescriptionTitle}</Text>
        <Text style={styles.heroSubtitle}>Bệnh nhân: {patientName}</Text>
        <View style={[styles.statusBadge, isActive ? styles.statusActive : styles.statusPaused]}>
          <Text style={[styles.statusText, isActive ? styles.statusTextActive : styles.statusTextPaused]}>
            {isActive ? 'Đang hoạt động' : 'Tạm dừng'}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        {isEditing ? (
          <>
            <View style={styles.row}>
              <View style={styles.col}>
                <TextField label="Ngày bắt đầu *" value={startDate} onChangeText={setStartDate} placeholder="YYYY-MM-DD" />
              </View>
              <View style={styles.col}>
                <TextField
                  label="Ngày kết thúc"
                  value={endDate}
                  onChangeText={setEndDate}
                  placeholder="Để trống nếu không giới hạn"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tần suất uống</Text>
              <View style={styles.chipRow}>
                {FREQUENCY_OPTIONS.map((option) => (
                  <ChoiceChip
                    key={option}
                    label={formatScheduleFrequency(option)}
                    active={frequencyType === option}
                    onPress={() => setFrequencyType(option)}
                  />
                ))}
              </View>
            </View>

            {frequencyType === 'weekly' ? (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Các ngày trong tuần</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                  {WEEKDAY_OPTIONS.map((day) => (
                    <ChoiceChip
                      key={day.value}
                      label={day.label}
                      active={selectedDaysOfWeek.includes(day.value)}
                      onPress={() => toggleDayOfWeek(day.value)}
                    />
                  ))}
                </ScrollView>
              </View>
            ) : null}

            {frequencyType === 'interval' ? (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Uống cách mỗi (ngày)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                  {INTERVAL_DAY_OPTIONS.map((days) => (
                    <ChoiceChip
                      key={days}
                      label={`${days} ngày`}
                      active={intervalDays === days}
                      onPress={() => setIntervalDays(days)}
                    />
                  ))}
                </ScrollView>
              </View>
            ) : null}

            <TimeSlotPicker value={timeSlots} onChange={setTimeSlots} notesFromPrescription />

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nhắc trước (phút)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {REMINDER_MINUTE_OPTIONS.map((minutes) => (
                  <ChoiceChip
                    key={minutes}
                    label={minutes === 0 ? 'Không nhắc' : `${minutes} phút`}
                    active={reminderMinutesBefore === minutes}
                    onPress={() => setReminderMinutesBefore(minutes)}
                  />
                ))}
              </ScrollView>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Trạng thái</Text>
              <View style={styles.chipRow}>
                <ChoiceChip label="Đang hoạt động" active={isActive} onPress={() => setIsActive(true)} />
                <ChoiceChip label="Tạm dừng" active={!isActive} onPress={() => setIsActive(false)} />
              </View>
            </View>

            <View style={styles.buttonRow}>
              <Pressable style={styles.secondaryBtn} onPress={handleCancelEdit} disabled={saving}>
                <Text style={styles.secondaryBtnText}>Hủy</Text>
              </Pressable>
              <Pressable style={[styles.primaryBtn, saving && styles.primaryBtnDisabled]} onPress={() => void handleSave()} disabled={saving}>
                {saving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryBtnText}>Lưu thay đổi</Text>
                )}
              </Pressable>
            </View>
          </>
        ) : (
          <>
            <DetailRow label="Đơn thuốc" value={prescriptionTitle} />
            <DetailRow label="Tần suất" value={formatScheduleFrequency(schedule.frequencyType)} />
            {schedule.frequencyType === 'weekly' ? (
              <DetailRow label="Ngày trong tuần" value={formatDaysOfWeek(schedule.daysOfWeek)} />
            ) : null}
            {schedule.frequencyType === 'interval' ? (
              <DetailRow label="Uống cách mỗi" value={`${schedule.intervalDays ?? '—'} ngày`} />
            ) : null}
            <DetailRow label="Khung giờ" value={timeLabel} />
            <DetailRow label="Thời gian" value={formatDateRange(schedule.startDate, schedule.endDate)} />
            <DetailRow
              label="Nhắc trước"
              value={schedule.reminderMinutesBefore === 0 ? 'Không nhắc' : `${schedule.reminderMinutesBefore ?? 5} phút`}
            />

            <Pressable style={styles.primaryBtn} onPress={() => setIsEditing(true)}>
              <Text style={styles.primaryBtnText}>Chỉnh sửa lịch uống thuốc</Text>
            </Pressable>
          </>
        )}
      </View>

      <AppAlert
        visible={Boolean(alert)}
        title={alert?.title ?? ''}
        message={alert?.message ?? ''}
        tone={alert?.tone}
        onClose={() => {
          const onClose = alert?.onClose;
          setAlert(null);
          onClose?.();
        }}
      />
    </AppScreen>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 10,
  },
  meta: {
    fontSize: 14,
    fontFamily: MedsTheme.fonts.sans,
    color: MedsTheme.colors.body,
  },
  hero: {
    gap: 6,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 24,
    fontFamily: MedsTheme.fonts.sansSemiBold,
    color: MedsTheme.colors.ink,
  },
  heroSubtitle: {
    fontSize: 14,
    fontFamily: MedsTheme.fonts.sans,
    color: MedsTheme.colors.body,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 4,
  },
  statusActive: {
    backgroundColor: '#ECFDF3',
  },
  statusPaused: {
    backgroundColor: MedsTheme.colors.surfaceStrong,
  },
  statusText: {
    fontSize: 12,
    fontFamily: MedsTheme.fonts.sansMedium,
  },
  statusTextActive: {
    color: MedsTheme.colors.semanticSuccess,
  },
  statusTextPaused: {
    color: MedsTheme.colors.muted,
  },
  card: {
    backgroundColor: MedsTheme.colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: MedsTheme.colors.border,
    padding: 16,
    gap: 12,
  },
  detailRow: {
    gap: 4,
  },
  detailLabel: {
    fontSize: 13,
    fontFamily: MedsTheme.fonts.sansSemiBold,
    color: MedsTheme.colors.body,
  },
  detailValue: {
    fontSize: 15,
    fontFamily: MedsTheme.fonts.sansMedium,
    color: MedsTheme.colors.ink,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: MedsTheme.fonts.sansSemiBold,
    color: MedsTheme.colors.textMain,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  scrollContent: {
    gap: 8,
    paddingVertical: 2,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  col: {
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  primaryBtn: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: MedsTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  primaryBtnDisabled: {
    opacity: 0.6,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: MedsTheme.fonts.sansSemiBold,
  },
  secondaryBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MedsTheme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  secondaryBtnText: {
    color: MedsTheme.colors.textMain,
    fontSize: 16,
    fontFamily: MedsTheme.fonts.sansSemiBold,
  },
  error: {
    color: MedsTheme.colors.critical,
    fontFamily: MedsTheme.fonts.sansMedium,
    fontSize: 14,
  },
});
