import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppAlert } from '@/components/meds/app-alert';
import { DateScrollPicker, EndDateScrollPicker, todayInputValue } from '@/components/meds/date-scroll-picker';
import { TimeSlotPicker } from '@/components/meds/time-slot-picker';
import { AppScreen, ChoiceChip, PageHeader } from '@/components/meds/ui-kit';
import { formatMedicationForm, formatMedicationUsage } from '@/constants/medication-labels';
import { MedsTheme } from '@/constants/meds-theme';
import {
  formatPrescriptionMedications,
  formatPrescriptionPeriod,
  getPrescriptionDetailApi,
  getPrescriptionErrorMessage,
  getPrescriptionsByPatientApi,
  type PrescriptionDetail,
  type PrescriptionSummary,
} from '@/services/prescription-api';
import {
  buildTimeSlotsFromPrescription,
  createScheduleApi,
  formatScheduleFrequency,
  getScheduleErrorMessage,
  toDateInputValue,
  type ScheduleFrequencyType,
  type ScheduleTimeSlot,
} from '@/services/schedule-api';
import { resolveAuthUserId, useAuth } from '@/store/auth-store';

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

export default function NewMedicineScreen() {
  const { patientId: patientIdParam, patientName, prescriptionId: prescriptionIdParam } = useLocalSearchParams<{
    patientId?: string;
    patientName?: string;
    prescriptionId?: string;
  }>();

  const { accessToken, role, user } = useAuth();
  const authPatientId = resolveAuthUserId(user);

  const [patientId, setPatientId] = useState(patientIdParam ?? authPatientId ?? '');
  const [prescriptionId, setPrescriptionId] = useState('');
  const [prescriptions, setPrescriptions] = useState<PrescriptionSummary[]>([]);
  const [prescriptionsLoading, setPrescriptionsLoading] = useState(false);
  const [prescriptionDetail, setPrescriptionDetail] = useState<PrescriptionDetail | null>(null);
  const [prescriptionDetailLoading, setPrescriptionDetailLoading] = useState(false);

  const [startDate, setStartDate] = useState(todayInputValue());
  const [endDate, setEndDate] = useState('');
  const [frequencyType, setFrequencyType] = useState<ScheduleFrequencyType>('daily');
  const [timeSlots, setTimeSlots] = useState<ScheduleTimeSlot[]>([]);
  const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState<number[]>([1, 3, 5]);
  const [intervalDays, setIntervalDays] = useState(2);
  const [reminderMinutesBefore, setReminderMinutesBefore] = useState(5);

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    title: string;
    message: string;
    tone?: 'success' | 'warning' | 'error';
    onClose?: () => void;
  } | null>(null);

  const displayPatientName = patientName?.trim() || user?.name?.trim() || 'Bệnh nhân';
  const selectedPrescription = prescriptions.find((item) => item._id === prescriptionId);

  useEffect(() => {
    if (patientIdParam?.trim()) {
      setPatientId(patientIdParam.trim());
      return;
    }
    if (role === 'patient' && authPatientId) {
      setPatientId(authPatientId);
    }
  }, [patientIdParam, role, authPatientId]);

  const loadPrescriptions = useCallback(async () => {
    if (!accessToken || !patientId.trim()) {
      setPrescriptions([]);
      return;
    }

    try {
      setPrescriptionsLoading(true);
      const response = await getPrescriptionsByPatientApi({ patientId: patientId.trim() }, accessToken);
      setPrescriptions(response.data.prescriptions ?? []);
    } catch {
      setPrescriptions([]);
    } finally {
      setPrescriptionsLoading(false);
    }
  }, [accessToken, patientId]);

  useEffect(() => {
    void loadPrescriptions();
  }, [loadPrescriptions]);

  const applyPrescriptionPrefill = useCallback((detail: PrescriptionDetail) => {
    setPrescriptionDetail(detail);
    setStartDate(todayInputValue());
    const prescriptionEnd = toDateInputValue(detail.endDate);
    setEndDate(prescriptionEnd && prescriptionEnd > todayInputValue() ? prescriptionEnd : '');
    setTimeSlots(buildTimeSlotsFromPrescription(detail));
    setFrequencyType('daily');
  }, []);

  const loadPrescriptionDetail = useCallback(
    async (id: string) => {
      if (!accessToken) return;
      try {
        setPrescriptionDetailLoading(true);
        const response = await getPrescriptionDetailApi(id, accessToken);
        applyPrescriptionPrefill(response.data);
      } catch (err) {
        setPrescriptionDetail(null);
        setAlert({
          title: 'Không tải được đơn thuốc',
          message: getPrescriptionErrorMessage(err),
          tone: 'error',
        });
      } finally {
        setPrescriptionDetailLoading(false);
      }
    },
    [accessToken, applyPrescriptionPrefill],
  );

  const handleSelectPrescription = (id: string) => {
    setPrescriptionId(id);
    void loadPrescriptionDetail(id);
  };

  useEffect(() => {
    if (prescriptionsLoading || !prescriptions.length || prescriptionId) return;

    const preferredId = prescriptionIdParam?.trim();
    const autoId =
      preferredId && prescriptions.some((item) => item._id === preferredId)
        ? preferredId
        : prescriptions.length === 1
          ? prescriptions[0]._id
          : null;

    if (autoId) {
      setPrescriptionId(autoId);
      void loadPrescriptionDetail(autoId);
    }
  }, [prescriptions, prescriptionsLoading, prescriptionId, prescriptionIdParam, loadPrescriptionDetail]);

  const navigateAfterCreate = useCallback(() => {
    if (patientIdParam) {
      router.replace({
        pathname: '/caregiver/patient/[id]/schedule',
        params: { id: patientIdParam, name: displayPatientName },
      });
      return;
    }
    router.replace('/schedule');
  }, [displayPatientName, patientIdParam]);

  const toggleDayOfWeek = (day: number) => {
    setSelectedDaysOfWeek((prev) => {
      if (prev.includes(day)) {
        return prev.filter((item) => item !== day);
      }
      return [...prev, day].sort((a, b) => a - b);
    });
  };

  const handleSubmit = async () => {
    if (!accessToken) {
      setAlert({ title: 'Lỗi', message: 'Phiên đăng nhập đã hết hạn.', tone: 'error' });
      return;
    }
    if (!patientId.trim()) {
      setAlert({ title: 'Thiếu thông tin', message: 'Không xác định được bệnh nhân.', tone: 'warning' });
      return;
    }
    if (!prescriptionId) {
      setAlert({ title: 'Thiếu thông tin', message: 'Vui lòng chọn đơn thuốc.', tone: 'warning' });
      return;
    }

    if (!timeSlots.length) {
      setAlert({ title: 'Thiếu thông tin', message: 'Cần ít nhất 1 khung giờ uống thuốc.', tone: 'warning' });
      return;
    }

    const daysOfWeek = selectedDaysOfWeek.filter((val) => val >= 0 && val <= 6);

    if (frequencyType === 'weekly' && daysOfWeek.length === 0) {
      setAlert({
        title: 'Thiếu thông tin',
        message: 'Chọn ít nhất 1 ngày trong tuần khi tần suất là hàng tuần.',
        tone: 'warning',
      });
      return;
    }

    if (frequencyType === 'interval' && intervalDays < 1) {
      setAlert({
        title: 'Thiếu thông tin',
        message: 'Khoảng cách ngày phải lớn hơn 0.',
        tone: 'warning',
      });
      return;
    }

    if (endDate.trim() && endDate.trim() <= startDate) {
      setAlert({
        title: 'Thiếu thông tin',
        message: 'Ngày kết thúc phải là ngày trong tương lai (sau ngày bắt đầu).',
        tone: 'warning',
      });
      return;
    }

    setLoading(true);
    try {
      await createScheduleApi(
        {
          patientId: patientId.trim(),
          prescriptionId,
          startDate,
          endDate: endDate.trim() || undefined,
          frequencyType,
          timeSlots,
          daysOfWeek: frequencyType === 'weekly' ? daysOfWeek : undefined,
          intervalDays: frequencyType === 'interval' ? intervalDays : undefined,
          reminderMinutesBefore,
        },
        accessToken,
      );

      setAlert({
        title: 'Thành công',
        message: 'Lưu lịch uống thuốc mới thành công!',
        tone: 'success',
        onClose: navigateAfterCreate,
      });
    } catch (err) {
      setAlert({ title: 'Thất bại', message: getScheduleErrorMessage(err), tone: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppScreen hero paddedBottom={44}>
      <Stack.Screen options={{ title: 'Thêm lịch uống thuốc', headerShadowVisible: false }} />
      <PageHeader
        title="Thêm lịch uống thuốc"
        subtitle="Chọn đơn thuốc — hệ thống lấy chi tiết và điền sẵn vào form."
      />

      <View style={styles.formContainer}>
        <View style={styles.readonlyField}>
          <Text style={styles.readonlyLabel}>Tên bệnh nhân</Text>
          <Text style={styles.readonlyValue}>{displayPatientName}</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Chọn đơn thuốc *</Text>
          {prescriptionsLoading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={MedsTheme.colors.ink} />
              <Text style={styles.loadingText}>Đang tải danh sách đơn thuốc...</Text>
            </View>
          ) : prescriptions.length === 0 ? (
            <Text style={styles.emptyText}>Bệnh nhân chưa có đơn thuốc. Hãy tạo đơn thuốc trước.</Text>
          ) : (
            <View style={styles.optionList}>
              {prescriptions.map((pres) => {
                const active = prescriptionId === pres._id;
                return (
                  <Pressable
                    key={pres._id}
                    style={[styles.optionItem, active && styles.optionItemActive]}
                    onPress={() => handleSelectPrescription(pres._id)}>
                    <Text style={[styles.optionTitle, active && styles.optionTitleActive]}>
                      {pres.title ?? 'Đơn thuốc'}
                    </Text>
                    {pres.doctorName ? <Text style={styles.optionMeta}>Bác sĩ: {pres.doctorName}</Text> : null}
                    {formatPrescriptionPeriod(pres) ? (
                      <Text style={styles.optionMeta}>{formatPrescriptionPeriod(pres)}</Text>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        {prescriptionDetailLoading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={MedsTheme.colors.ink} />
            <Text style={styles.loadingText}>Đang lấy chi tiết đơn thuốc...</Text>
          </View>
        ) : null}

        {prescriptionDetail ? (
          <View style={styles.prefillCard}>
            <Text style={styles.prefillTitle}>Thông tin từ đơn thuốc</Text>
            <Text style={styles.prefillLine}>Tên đơn: {prescriptionDetail.title ?? 'Đơn thuốc'}</Text>
            {prescriptionDetail.doctorName ? (
              <Text style={styles.prefillLine}>Bác sĩ: {prescriptionDetail.doctorName}</Text>
            ) : null}
            <Text style={styles.prefillLine}>
              Thuốc: {formatPrescriptionMedications(prescriptionDetail.medications)}
            </Text>
            {prescriptionDetail.note ? (
              <Text style={styles.prefillLine}>Ghi chú: {prescriptionDetail.note}</Text>
            ) : null}
            {(prescriptionDetail.medications ?? [])
              .filter((item) => typeof item === 'object')
              .map((med) => (
                <Text key={med._id} style={styles.prefillMed}>
                  • {med.name}
                  {med.dosage ? ` — ${med.dosage}` : ''}
                  {med.form ? ` (${formatMedicationForm(med.form)})` : ''}
                  {med.usageNote ? ` · ${formatMedicationUsage(med.usageNote)}` : ''}
                </Text>
              ))}
          </View>
        ) : null}

        <DateScrollPicker
          label="Ngày bắt đầu *"
          hint="Mặc định là hôm nay — ngày tạo lịch uống thuốc"
          value={startDate}
          onChange={setStartDate}
          minDate={todayInputValue()}
        />

        <EndDateScrollPicker
          label="Ngày kết thúc"
          hint="Chọn ngày trong tương lai hoặc để chưa rõ nếu chưa biết khi nào kết thúc"
          value={endDate}
          onChange={setEndDate}
          minDate={startDate}
        />

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
            <Text style={styles.scrollHint}>Cuộn ngang và chọn ngày uống thuốc</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dayScrollContent}>
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
            <Text style={styles.scrollHint}>Cuộn ngang và chọn khoảng cách</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dayScrollContent}>
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

        <TimeSlotPicker
          value={timeSlots}
          onChange={setTimeSlots}
          notesFromPrescription={Boolean(prescriptionDetail)}
          defaultDosageNote={prescriptionDetail?.note?.trim() || 'Theo đơn thuốc'}
        />

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Nhắc trước (phút)</Text>
          <Text style={styles.scrollHint}>Cuộn ngang và chọn thời gian nhắc</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dayScrollContent}>
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

        {selectedPrescription ? (
          <Text style={styles.selectedHint}>Liên kết đơn: {selectedPrescription.title ?? 'Đơn thuốc'}</Text>
        ) : null}

        <View style={styles.buttonRow}>
          <Pressable style={styles.cancelButton} onPress={() => router.back()} disabled={loading}>
            <Text style={styles.cancelButtonText}>Hủy</Text>
          </Pressable>
          <Pressable
            style={[styles.saveButton, (loading || !prescriptionId) && styles.saveButtonDisabled]}
            onPress={() => void handleSubmit()}
            disabled={loading || !prescriptionId}>
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Lưu lịch uống thuốc</Text>
            )}
          </Pressable>
        </View>
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

const styles = StyleSheet.create({
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayScrollContent: {
    gap: 8,
    paddingVertical: 2,
  },
  scrollHint: {
    fontSize: 12,
    fontFamily: MedsTheme.fonts.sans,
    color: MedsTheme.colors.muted,
  },
  formContainer: {
    backgroundColor: MedsTheme.colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: MedsTheme.colors.border,
    padding: 16,
    gap: 12,
  },
  readonlyField: {
    gap: 4,
  },
  readonlyLabel: {
    fontSize: 14,
    fontFamily: MedsTheme.fonts.sansSemiBold,
    color: MedsTheme.colors.textMain,
  },
  readonlyValue: {
    fontSize: 16,
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
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: MedsTheme.fonts.sans,
    color: MedsTheme.colors.body,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: MedsTheme.fonts.sans,
    color: MedsTheme.colors.body,
    fontStyle: 'italic',
  },
  optionList: {
    gap: 8,
  },
  optionItem: {
    borderWidth: 1,
    borderColor: MedsTheme.colors.border,
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#F8FBFF',
  },
  optionItemActive: {
    borderColor: '#A8D2FF',
    backgroundColor: '#EAF6FF',
  },
  optionTitle: {
    fontSize: 15,
    fontFamily: MedsTheme.fonts.sansSemiBold,
    color: MedsTheme.colors.textMain,
  },
  optionTitleActive: {
    color: '#005DCC',
  },
  optionMeta: {
    marginTop: 2,
    fontSize: 13,
    fontFamily: MedsTheme.fonts.sans,
    color: MedsTheme.colors.body,
  },
  prefillCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    backgroundColor: '#ECFDF3',
    padding: 12,
    gap: 4,
  },
  prefillTitle: {
    fontSize: 14,
    fontFamily: MedsTheme.fonts.sansSemiBold,
    color: MedsTheme.colors.ink,
    marginBottom: 4,
  },
  prefillLine: {
    fontSize: 13,
    fontFamily: MedsTheme.fonts.sans,
    color: MedsTheme.colors.body,
    lineHeight: 18,
  },
  prefillMed: {
    fontSize: 13,
    fontFamily: MedsTheme.fonts.sansMedium,
    color: MedsTheme.colors.ink,
    lineHeight: 18,
  },
  selectedHint: {
    fontSize: 13,
    fontFamily: MedsTheme.fonts.sansMedium,
    color: MedsTheme.colors.textLink,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MedsTheme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  cancelButtonText: {
    color: MedsTheme.colors.textMain,
    fontSize: 16,
    fontFamily: MedsTheme.fonts.sansSemiBold,
  },
  saveButton: {
    flex: 2,
    height: 48,
    borderRadius: 12,
    backgroundColor: MedsTheme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: MedsTheme.fonts.sansSemiBold,
  },
});
