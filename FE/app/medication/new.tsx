import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppAlert } from '@/components/meds/app-alert';
import { MedsTheme } from '@/constants/meds-theme';
import { formatMedicationForm, formatMedicationUsage } from '@/constants/medication-labels';
import {
  createMedicationApi,
  getMedicationsByPatientApi,
  type MedicationSummary,
} from '@/services/medication-api';
import {
  createPrescriptionApi,
  getPrescriptionErrorMessage,
} from '@/services/prescription-api';
import { resolveAuthUserId, useAuth } from '@/store/auth-store';

export default function NewPrescriptionScreen() {
  const { patientId: patientIdParam, patientName } = useLocalSearchParams<{
    patientId?: string;
    patientName?: string;
  }>();

  const isCaregiverFlow = Boolean(patientIdParam);
  const [patientId, setPatientId] = useState(patientIdParam ?? '');
  const [title, setTitle] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [note, setNote] = useState('');

  const [selectedMedIds, setSelectedMedIds] = useState<string[]>([]);
  const [allMedications, setAllMedications] = useState<MedicationSummary[]>([]);
  const [medicationsLoading, setMedicationsLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showQuickAddMed, setShowQuickAddMed] = useState(false);
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [creatingMed, setCreatingMed] = useState(false);

  const [alert, setAlert] = useState<{ title: string; message: string; onClose?: () => void } | null>(null);

  const { accessToken, role, user } = useAuth();
  const authPatientId = resolveAuthUserId(user);
  const displayPatientName = patientName?.trim() || user?.name?.trim() || 'Bệnh nhân';
  const screenTitle = useMemo(
    () => (displayPatientName !== 'Bệnh nhân' ? `Thêm đơn thuốc — ${displayPatientName}` : 'Thêm đơn thuốc mới'),
    [displayPatientName],
  );

  useEffect(() => {
    if (patientIdParam?.trim()) {
      setPatientId(patientIdParam.trim());
      return;
    }
    if (role === 'patient' && authPatientId) {
      setPatientId(authPatientId);
    }
  }, [patientIdParam, role, authPatientId]);

  const fetchAllMedications = useCallback(async () => {
    if (!accessToken || !patientId.trim()) {
      setAllMedications([]);
      return;
    }

    try {
      setMedicationsLoading(true);
      const response = await getMedicationsByPatientApi({ patientId: patientId.trim(), page: 1, limit: 50 }, accessToken);
      setAllMedications(response.data.medications ?? []);
    } catch (err) {
      setAlert({
        title: 'Không tải được thuốc',
        message: getPrescriptionErrorMessage(err),
      });
    } finally {
      setMedicationsLoading(false);
    }
  }, [accessToken, patientId]);

  useEffect(() => {
    void fetchAllMedications();
  }, [fetchAllMedications]);

  const toggleMedicationSelection = useCallback((medId: string) => {
    setSelectedMedIds((prev) => (prev.includes(medId) ? prev.filter((id) => id !== medId) : [...prev, medId]));
  }, []);

  const navigateAfterCreate = useCallback(() => {
    if (isCaregiverFlow && patientIdParam) {
      router.replace({
        pathname: '/caregiver/patient/[id]/prescriptions',
        params: { id: patientIdParam, name: patientName ?? 'Bệnh nhân' },
      });
      return;
    }
    router.replace('/prescriptions');
  }, [isCaregiverFlow, patientIdParam, patientName]);

  const handleQuickAddMedication = async () => {
    if (!accessToken || !patientId.trim()) {
      setAlert({ title: 'Lỗi', message: 'Thiếu thông tin bệnh nhân.' });
      return;
    }
    if (!newMedName.trim() || !newMedDosage.trim()) {
      setAlert({ title: 'Thiếu thông tin', message: 'Vui lòng nhập tên thuốc và liều dùng.' });
      return;
    }

    try {
      setCreatingMed(true);
      const response = await createMedicationApi(
        {
          patientId: patientId.trim(),
          name: newMedName.trim(),
          dosage: newMedDosage.trim(),
        },
        accessToken,
      );
      const created = response.data;
      setAllMedications((prev) => [created, ...prev]);
      setSelectedMedIds((prev) => [...prev, created._id]);
      setNewMedName('');
      setNewMedDosage('');
      setShowQuickAddMed(false);
    } catch (err) {
      setAlert({ title: 'Không thêm được thuốc', message: getPrescriptionErrorMessage(err) });
    } finally {
      setCreatingMed(false);
    }
  };

  const handleSubmit = async () => {
    if (!accessToken) {
      setAlert({ title: 'Lỗi', message: 'Phiên đăng nhập đã hết hạn.' });
      return;
    }

    if (!patientId.trim()) {
      setAlert({ title: 'Thiếu thông tin', message: 'Vui lòng chọn bệnh nhân.' });
      return;
    }

    if (selectedMedIds.length === 0) {
      setAlert({ title: 'Thiếu thuốc', message: 'Đơn thuốc phải có ít nhất 1 loại thuốc.' });
      return;
    }

    try {
      setLoading(true);
      await createPrescriptionApi(
        {
          patientId: patientId.trim(),
          title: title.trim() || undefined,
          medications: selectedMedIds,
          doctorName: doctorName.trim() || undefined,
          note: note.trim() || undefined,
        },
        accessToken,
      );

      setAlert({
        title: 'Thành công',
        message: 'Đơn thuốc đã được tạo.',
        onClose: navigateAfterCreate,
      });
    } catch (err) {
      setAlert({ title: 'Không tạo được đơn thuốc', message: getPrescriptionErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <Stack.Screen options={{ title: screenTitle, headerShadowVisible: false }} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tạo đơn thuốc mới</Text>
          <Text style={styles.cardSubtitle}>Bệnh nhân: {displayPatientName}</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Tên đơn thuốc</Text>
            <TextInput
              style={styles.textInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Ví dụ: Đơn điều trị huyết áp"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Bác sĩ chỉ định</Text>
            <TextInput style={styles.textInput} value={doctorName} onChangeText={setDoctorName} placeholder="Tên bác sĩ" />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.medHeaderRow}>
              <Text style={styles.inputLabel}>Chọn thuốc trong đơn *</Text>
              <Pressable onPress={() => setShowQuickAddMed((prev) => !prev)} style={styles.quickAddBtn}>
                <Ionicons name={showQuickAddMed ? 'remove-circle-outline' : 'add-circle-outline'} size={16} color={MedsTheme.colors.textLink} />
                <Text style={styles.quickAddText}>{showQuickAddMed ? 'Đóng' : 'Thêm thuốc'}</Text>
              </Pressable>
            </View>

            {showQuickAddMed ? (
              <View style={styles.quickAddBox}>
                <TextInput
                  style={styles.textInput}
                  value={newMedName}
                  onChangeText={setNewMedName}
                  placeholder="Tên thuốc"
                />
                <TextInput
                  style={styles.textInput}
                  value={newMedDosage}
                  onChangeText={setNewMedDosage}
                  placeholder="Liều dùng (vd: 10ml, 1 viên)"
                />
                <Pressable
                  style={[styles.quickAddSubmit, creatingMed && styles.buttonDisabled]}
                  onPress={() => void handleQuickAddMedication()}
                  disabled={creatingMed}>
                  <Text style={styles.quickAddSubmitText}>{creatingMed ? 'Đang thêm...' : 'Lưu thuốc mới'}</Text>
                </Pressable>
              </View>
            ) : null}

            {medicationsLoading ? (
              <View style={styles.smallLoadingWrap}>
                <ActivityIndicator size="small" color={MedsTheme.colors.primary} />
                <Text style={styles.smallLoadingText}>Đang tải danh sách thuốc...</Text>
              </View>
            ) : allMedications.length === 0 ? (
              <Text style={styles.emptyText}>Bệnh nhân chưa có thuốc. Nhấn "Thêm thuốc" để tạo trước khi lập đơn.</Text>
            ) : (
              <View style={styles.medSelectorList}>
                {allMedications.map((med) => {
                  const isSelected = selectedMedIds.includes(med._id);
                  return (
                    <Pressable
                      key={med._id}
                      style={[styles.medSelectorItem, isSelected && styles.medSelectorItemActive]}
                      onPress={() => toggleMedicationSelection(med._id)}>
                      <Ionicons
                        name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                        size={20}
                        color={isSelected ? MedsTheme.colors.success : MedsTheme.colors.textMuted}
                      />
                      <View style={styles.medSelectorInfo}>
                        <Text style={[styles.medSelectorName, isSelected && styles.medSelectorNameActive]}>{med.name}</Text>
                        <Text style={styles.medSelectorDesc}>
                          {med.dosage}
                          {med.form ? ` • ${formatMedicationForm(med.form)}` : ''}
                          {med.usageNote ? ` • ${formatMedicationUsage(med.usageNote)}` : ''}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Ghi chú</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={note}
              onChangeText={setNote}
              placeholder="Nhập ghi chú"
              multiline
            />
          </View>

          <View style={styles.actionRow}>
            <Pressable style={styles.cancelButton} onPress={() => router.back()} disabled={loading}>
              <Text style={styles.cancelBtnText}>Hủy</Text>
            </Pressable>
            <Pressable style={[styles.editButton, loading && styles.buttonDisabled]} onPress={() => void handleSubmit()} disabled={loading}>
              <Text style={styles.btnText}>{loading ? 'Đang lưu...' : 'Lưu đơn thuốc'}</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <AppAlert
        visible={Boolean(alert)}
        title={alert?.title ?? ''}
        message={alert?.message ?? ''}
        onClose={() => {
          const onClose = alert?.onClose;
          setAlert(null);
          onClose?.();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: MedsTheme.colors.canvasSoft,
  },
  content: {
    padding: MedsTheme.spacing.base,
    gap: MedsTheme.spacing.sm,
    paddingBottom: 28,
  },
  card: {
    borderRadius: MedsTheme.radius.xl,
    borderWidth: 1,
    borderColor: MedsTheme.colors.hairlineStrong,
    backgroundColor: MedsTheme.colors.surfaceCard,
    padding: MedsTheme.spacing.base,
    gap: MedsTheme.spacing.sm,
    ...MedsTheme.elevation.card,
  },
  cardTitle: {
    fontSize: 20,
    fontFamily: MedsTheme.fonts.sansSemiBold,
    color: MedsTheme.colors.textMain,
    borderBottomWidth: 1,
    borderBottomColor: MedsTheme.colors.border,
    paddingBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    fontFamily: MedsTheme.fonts.sans,
    color: MedsTheme.colors.body,
    marginTop: -4,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: MedsTheme.fonts.sansSemiBold,
    color: MedsTheme.colors.textMain,
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: MedsTheme.colors.hairlineStrong,
    borderRadius: MedsTheme.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: MedsTheme.colors.canvas,
    color: MedsTheme.colors.textMain,
    fontFamily: MedsTheme.fonts.sans,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  medHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  quickAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quickAddText: {
    fontSize: 13,
    fontFamily: MedsTheme.fonts.sansMedium,
    color: MedsTheme.colors.textLink,
  },
  quickAddBox: {
    gap: 8,
    marginBottom: 10,
    padding: 10,
    borderRadius: MedsTheme.radius.md,
    backgroundColor: MedsTheme.colors.brandNameSoft,
    borderWidth: 1,
    borderColor: MedsTheme.colors.hairlineStrong,
  },
  quickAddSubmit: {
    minHeight: 40,
    borderRadius: MedsTheme.radius.md,
    backgroundColor: MedsTheme.colors.brandName,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickAddSubmitText: {
    color: '#FFFFFF',
    fontFamily: MedsTheme.fonts.sansMedium,
    fontSize: 14,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  editButton: {
    flex: 2,
    height: 50,
    borderRadius: MedsTheme.radius.lg,
    backgroundColor: MedsTheme.colors.brandName,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    flex: 1,
    height: 50,
    borderRadius: MedsTheme.radius.lg,
    backgroundColor: MedsTheme.colors.surfaceStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  btnText: {
    color: '#FFFFFF',
    fontFamily: MedsTheme.fonts.sansSemiBold,
    fontSize: 16,
  },
  cancelBtnText: {
    color: '#4F5E74',
    fontFamily: MedsTheme.fonts.sansSemiBold,
    fontSize: 16,
  },
  smallLoadingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  smallLoadingText: {
    color: MedsTheme.colors.textMuted,
    fontSize: 14,
    fontFamily: MedsTheme.fonts.sans,
  },
  emptyText: {
    color: MedsTheme.colors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    fontFamily: MedsTheme.fonts.sans,
  },
  medSelectorList: {
    gap: 8,
    marginTop: 4,
  },
  medSelectorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: MedsTheme.colors.canvas,
    borderWidth: 1,
    borderColor: MedsTheme.colors.hairlineStrong,
    borderRadius: MedsTheme.radius.md,
    padding: 12,
  },
  medSelectorItemActive: {
    backgroundColor: MedsTheme.colors.brandNameSoft,
    borderColor: MedsTheme.colors.brandName,
  },
  medSelectorInfo: {
    flex: 1,
  },
  medSelectorName: {
    fontSize: 15,
    fontFamily: MedsTheme.fonts.sansSemiBold,
    color: MedsTheme.colors.textMain,
  },
  medSelectorNameActive: {
    color: MedsTheme.colors.brandName,
  },
  medSelectorDesc: {
    fontSize: 12,
    color: MedsTheme.colors.textMuted,
    marginTop: 2,
    fontFamily: MedsTheme.fonts.sans,
  },
});
