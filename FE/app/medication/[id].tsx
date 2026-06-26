import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, ActivityIndicator, TextInput, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';

import { FeedbackToast } from '@/components/meds/feedback-toast';
import { MedsTheme } from '@/constants/meds-theme';
import { useAuth } from '@/store/auth-store';

interface Medication {
  _id: string;
  name: string;
  dosage: string;
  form?: string;
  unit?: string;
  usageNote?: string;
  description?: string;
}

interface Prescription {
  _id: string;
  patientId?: any;
  title: string;
  doctorName?: string;
  startDate?: string;
  endDate?: string;
  prescribedAt?: string;
  note?: string;
  medications: Medication[];
}

const mockMedications: Record<string, { name: string; subtitle: string; form?: string; note?: string }> = {
  'paracetamol-500': { name: 'Paracetamol 500mg', subtitle: 'Thuốc giảm đau (Ngày 1 viên)', form: 'Viên nén', note: 'Sau ăn' },
  'vitamin-c': { name: 'Vitamin C', subtitle: 'Bổ sung đề kháng (Ngày 1 viên)', form: 'Viên sủi', note: 'Sau ăn' },
  'bao-thanh-syrup': { name: 'Siro ho Bảo Thanh', subtitle: 'Syrup ho (Ngày 2 lần)', form: 'Siro', note: 'Sau ăn' },
  'huyet-ap': { name: 'Amlodipine 5mg', subtitle: 'Thuốc huyết áp (Ngày 1 viên)', form: 'Viên nén', note: 'Sau ăn' },
  amlodipine: { name: 'Amlodipine 5mg', subtitle: 'Thuốc huyết áp (Ngày 1 viên)', form: 'Viên nén', note: 'Sau ăn' },
  'omega-3': { name: 'Omega 3', subtitle: 'Bổ sung tim mạch (Ngày 1 viên)', form: 'Viên nang', note: 'Sau ăn' },
};

export default function MedicationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState<string | null>(null);
  const { accessToken, logout } = useAuth();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editDoctorName, setEditDoctorName] = useState<string>('');
  const [editStartDate, setEditStartDate] = useState<string>('');
  const [editEndDate, setEditEndDate] = useState<string>('');
  const [editPrescribedAt, setEditPrescribedAt] = useState<string>('');
  const [editNote, setEditNote] = useState<string>('');
  const [editIsActive, setEditIsActive] = useState<boolean>(true);
  const [selectedMedIds, setSelectedMedIds] = useState<string[]>([]);
  const [allMedications, setAllMedications] = useState<Medication[]>([]);
  const [medicationsLoading, setMedicationsLoading] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);

  const fetchPrescriptionDetail = useCallback(async () => {
    if (!isObjectId || !accessToken) return;
    try {
      setLoading(true);
      setError(null);
      const url = `http://localhost:3000/api/v1/prescriptions/${id}`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.data && response.data.data) {
        const data = response.data.data;
        setPrescription(data);
        setEditTitle(data.title || '');
        setEditDoctorName(data.doctorName || '');
        setEditStartDate(data.startDate ? data.startDate.split('T')[0] : '');
        setEditEndDate(data.endDate ? data.endDate.split('T')[0] : '');
        setEditPrescribedAt(data.prescribedAt ? data.prescribedAt.split('T')[0] : '');
        setEditNote(data.note || '');
        setEditIsActive(data.isActive !== undefined ? data.isActive : true);
        const medIds = data.medications ? data.medications.map((m: any) => m._id || m) : [];
        setSelectedMedIds(medIds);
      } else {
        setError('Không tìm thấy dữ liệu đơn thuốc.');
      }
    } catch (err: any) {
      console.error('Error fetching prescription detail:', err);
      setError(err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi tải chi tiết đơn thuốc');
    } finally {
      setLoading(false);
    }
  }, [id, accessToken, isObjectId]);

  const handleUpdatePrescription = async () => {
    if (!accessToken) {
      if (Platform.OS === 'web') {
        window.alert('Phiên đăng nhập đã hết hạn.');
      } else {
        Alert.alert('Lỗi', 'Phiên đăng nhập đã hết hạn.');
      }
      return;
    }
    try {
      setActionLoading(true);
      const url = `http://localhost:3000/api/v1/prescriptions/${id}`;
      const body: any = {};
      if (editTitle && editTitle.trim()) body.title = editTitle.trim();
      if (editDoctorName && editDoctorName.trim()) body.doctorName = editDoctorName.trim();
      if (editStartDate && editStartDate.trim()) body.startDate = editStartDate.trim();
      if (editEndDate && editEndDate.trim()) body.endDate = editEndDate.trim();
      if (editPrescribedAt && editPrescribedAt.trim()) body.prescribedAt = editPrescribedAt.trim();
      if (editNote !== undefined) body.note = editNote;
      if (editIsActive !== undefined) body.isActive = editIsActive;

      body.medications = selectedMedIds;

      console.log('Sending PUT to update prescription:', body);
      const response = await axios.put(url, body, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Update prescription response:', response.data);
      if (Platform.OS === 'web') {
        window.alert('Cập nhật đơn thuốc thành công!');
        router.replace('/prescriptions');
      } else {
        Alert.alert('Thành công', 'Cập nhật đơn thuốc thành công!', [
          {
            text: 'OK',
            onPress: () => router.replace('/prescriptions'),
          },
        ]);
      }
    } catch (err: any) {
      console.error('Error updating prescription:', err);
      if (err?.response?.status === 401) {
        logout();
        return;
      }
      const errMsg = err?.response?.data?.message || err?.message || 'Không thể cập nhật đơn thuốc';
      if (Platform.OS === 'web') {
        window.alert('Lỗi: ' + errMsg);
      } else {
        Alert.alert('Lỗi', errMsg);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePrescription = async () => {
    if (!accessToken) {
      if (Platform.OS === 'web') {
        window.alert('Phiên đăng nhập đã hết hạn.');
      } else {
        Alert.alert('Lỗi', 'Phiên đăng nhập đã hết hạn.');
      }
      return;
    }

    const performDelete = async () => {
      try {
        setActionLoading(true);
        const url = `http://localhost:3000/api/v1/prescriptions/${id}`;
        console.log('Sending DELETE to url:', url);
        const response = await axios.delete(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        console.log('Delete prescription response:', response.data);
        if (Platform.OS === 'web') {
          window.alert('Đã xóa đơn thuốc.');
          router.replace('/prescriptions');
        } else {
          Alert.alert('Thành công', 'Đã xóa đơn thuốc.', [
            {
              text: 'OK',
              onPress: () => router.replace('/prescriptions'),
            },
          ]);
        }
      } catch (err: any) {
        console.error('Error deleting prescription:', err);
        const errMsg = err?.response?.data?.message || err?.message || 'Không thể xóa đơn thuốc';
        if (Platform.OS === 'web') {
          window.alert('Lỗi: ' + errMsg);
        } else {
          Alert.alert('Lỗi', errMsg);
        }
      } finally {
        setActionLoading(false);
      }
    };

    if (Platform.OS === 'web') {
      const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa đơn thuốc này không?');
      if (confirmDelete) {
        performDelete();
      }
    } else {
      Alert.alert(
        'Xác nhận xóa',
        'Bạn có chắc chắn muốn xóa đơn thuốc này không?',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Xóa', style: 'destructive', onPress: performDelete },
        ]
      );
    }
  };

  const fetchAllMedications = useCallback(async () => {
    if (!accessToken) return;
    try {
      setMedicationsLoading(true);
      const url = 'http://localhost:3000/api/v1/medications/patient/6a3cef8fd789d8d7be4b7e47?page=1&limit=20';
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (response.data && response.data.data && response.data.data.medications) {
        setAllMedications(response.data.data.medications);
      }
    } catch (err) {
      console.error('Error fetching medications:', err);
    } finally {
      setMedicationsLoading(false);
    }
  }, [accessToken]);

  const toggleMedicationSelection = useCallback((medId: string) => {
    setSelectedMedIds((prev) => {
      if (prev.includes(medId)) {
        return prev.filter((id) => id !== medId);
      } else {
        return [...prev, medId];
      }
    });
  }, []);

  useEffect(() => {
    fetchPrescriptionDetail();
  }, [fetchPrescriptionDetail]);

  useEffect(() => {
    if (isEditing && allMedications.length === 0) {
      fetchAllMedications();
    }
  }, [isEditing, allMedications.length, fetchAllMedications]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={MedsTheme.colors.primary} />
          <Text style={styles.loadingText}>Đang tải chi tiết đơn thuốc...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={48} color={MedsTheme.colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={fetchPrescriptionDetail}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Render static mock screen if it's not a valid backend MongoDB ID
  if (!isObjectId) {
    const mockDetail = mockMedications[id] ?? {
      name: 'Thuốc mới',
      subtitle: 'Điền thông tin chi tiết cho thuốc',
      form: 'Viên nén',
      note: 'Sau ăn',
    };

    return (
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <Stack.Screen
          options={{
            title: 'Chi tiết thuốc',
            headerRight: () => (
              <Pressable
                hitSlop={10}
                onPress={() =>
                  router.push({
                    pathname: '/medicines/[id]/edit',
                    params: { id },
                  })
                }>
                <Ionicons name="create-outline" size={20} color={MedsTheme.colors.textMain} />
              </Pressable>
            ),
          }}
        />

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.heroWrap}>
            <View style={styles.heroOuter}>
              <View style={styles.heroInner}>
                <Ionicons name="medical" size={44} color="#B9C6D8" />
              </View>
            </View>

            <View style={styles.tagRow}>
              {mockDetail.form && (
                <View style={styles.tagPrimary}>
                  <Text style={styles.tagPrimaryText}>{mockDetail.form}</Text>
                </View>
              )}
              {mockDetail.note && (
                <View style={styles.tagSecondary}>
                  <Text style={styles.tagSecondaryText}>{mockDetail.note}</Text>
                </View>
              )}
            </View>

            <Text style={styles.title}>{mockDetail.name}</Text>
            <Text style={styles.subtitle}>{mockDetail.subtitle}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Lịch uống trong ngày</Text>
            <View style={styles.periodRow}>
              <View style={styles.periodBox}>
                <Text style={styles.periodLabel}>Sáng</Text>
              </View>
              <View style={[styles.periodBox, styles.periodBoxActive]}>
                <Text style={[styles.periodLabel, styles.periodLabelActive]}>Trưa</Text>
                <Text style={styles.periodTime}>12:00</Text>
              </View>
              <View style={styles.periodBox}>
                <Text style={styles.periodLabel}>Tối</Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Hướng dẫn sử dụng</Text>
            <View style={styles.guideRow}>
              <View style={styles.guideIcon}>
                <Ionicons name="restaurant-outline" size={15} color={MedsTheme.colors.primaryDark} />
              </View>
              <View style={styles.guideContent}>
                <Text style={styles.guideMain}>Uống sau khi ăn</Text>
                <Text style={styles.guideSub}>Đợi khoảng 30 phút sau bữa ăn chính để thuốc hấp thụ tốt nhất.</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={styles.remindButton}
            onPress={() => setFeedbackText('Đã đặt nhắc lại sau 15 phút cho thuốc này.')}>
            <Ionicons name="time-outline" size={16} color={MedsTheme.colors.primaryDark} />
            <Text style={styles.remindText}>Nhắc lại sau 15p</Text>
          </Pressable>

          <Pressable
            style={styles.confirmButton}
            onPress={() => setFeedbackText('Đã xác nhận uống thuốc thành công.')}>
            <Ionicons name="checkmark" size={18} color="#FFFFFF" />
            <Text style={styles.confirmText}>Đã uống</Text>
          </Pressable>
          <FeedbackToast message={feedbackText} onHide={() => setFeedbackText(null)} />
        </View>
      </SafeAreaView>
    );
  }

  // Render backend prescription detail
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Chi tiết đơn thuốc',
          headerRight: () => null,
        }}
      />

      {isEditing ? (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Chỉnh sửa đơn thuốc</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tên đơn thuốc</Text>
              <TextInput
                style={styles.textInput}
                value={editTitle}
                onChangeText={setEditTitle}
                placeholder="Nhập tên đơn thuốc"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Bác sĩ chỉ định</Text>
              <TextInput
                style={styles.textInput}
                value={editDoctorName}
                onChangeText={setEditDoctorName}
                placeholder="Tên bác sĩ"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Danh sách thuốc (Chọn một hoặc nhiều)</Text>
              {medicationsLoading ? (
                <View style={styles.smallLoadingWrap}>
                  <ActivityIndicator size="small" color={MedsTheme.colors.primary} />
                  <Text style={styles.smallLoadingText}>Đang tải danh sách thuốc...</Text>
                </View>
              ) : allMedications.length === 0 ? (
                <Text style={styles.emptyText}>Không tìm thấy thuốc nào của bệnh nhân.</Text>
              ) : (
                <View style={styles.medSelectorList}>
                  {allMedications.map((med) => {
                    const isSelected = selectedMedIds.includes(med._id);
                    return (
                      <Pressable
                        key={med._id}
                        style={[
                          styles.medSelectorItem,
                          isSelected && styles.medSelectorItemActive
                        ]}
                        onPress={() => toggleMedicationSelection(med._id)}
                      >
                        <Ionicons
                          name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                          size={20}
                          color={isSelected ? MedsTheme.colors.success : MedsTheme.colors.textMuted}
                        />
                        <View style={styles.medSelectorInfo}>
                          <Text style={[styles.medSelectorName, isSelected && styles.medSelectorNameActive]}>
                            {med.name}
                          </Text>
                          <Text style={styles.medSelectorDesc}>
                            {med.dosage}{med.form ? ` • ${med.form}` : ''}{med.usageNote ? ` • ${med.usageNote}` : ''}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Ngày bắt đầu (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.textInput}
                value={editStartDate}
                onChangeText={setEditStartDate}
                placeholder="2026-06-25"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Ngày kết thúc (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.textInput}
                value={editEndDate}
                onChangeText={setEditEndDate}
                placeholder="2026-07-25"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Ngày kê đơn (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.textInput}
                value={editPrescribedAt}
                onChangeText={setEditPrescribedAt}
                placeholder="2026-06-25"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Ghi chú</Text>
              <TextInput
                style={[styles.textInput, { height: 80, textAlignVertical: 'top' }]}
                value={editNote}
                onChangeText={setEditNote}
                placeholder="Nhập ghi chú"
                multiline
              />
            </View>



            <View style={styles.actionRow}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setIsEditing(false)}
                disabled={actionLoading}>
                <Text style={styles.cancelBtnText}>Hủy</Text>
              </Pressable>
              <Pressable
                style={styles.editButton}
                onPress={handleUpdatePrescription}
                disabled={actionLoading}>
                <Text style={styles.btnText}>
                  {actionLoading ? 'Đang lưu...' : 'Lưu'}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.heroWrap}>
              <View style={styles.heroOuter}>
                <View style={styles.heroInner}>
                  <Ionicons name="document-text" size={44} color="#B9C6D8" />
                </View>
              </View>

              <Text style={styles.title}>{prescription?.title}</Text>
              {prescription?.doctorName && (
                <Text style={styles.subtitle}>Bác sĩ chỉ định: {prescription.doctorName}</Text>
              )}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Thông tin chung</Text>
              {prescription?._id && (
                <Text style={styles.infoText}>
                  <Text style={styles.boldText}>Mã đơn thuốc (prescriptionId): </Text>
                  {prescription._id}
                </Text>
              )}
              {prescription?.patientId && (
                <Text style={styles.infoText}>
                  <Text style={styles.boldText}>Mã bệnh nhân (patientId): </Text>
                  {typeof prescription.patientId === 'object' ? prescription.patientId._id || JSON.stringify(prescription.patientId) : prescription.patientId}
                </Text>
              )}
              {prescription?.note && (
                <Text style={styles.infoText}>
                  <Text style={styles.boldText}>Ghi chú: </Text>
                  {prescription.note}
                </Text>
              )}
              {(prescription?.startDate || prescription?.endDate) && (
                <Text style={styles.infoText}>
                  <Text style={styles.boldText}>Thời gian: </Text>
                  {prescription.startDate ? new Date(prescription.startDate).toLocaleDateString('vi-VN') : 'N/A'} - {prescription.endDate ? new Date(prescription.endDate).toLocaleDateString('vi-VN') : 'N/A'}
                </Text>
              )}
              {prescription?.prescribedAt && (
                <Text style={styles.infoText}>
                  <Text style={styles.boldText}>Ngày kê đơn: </Text>
                  {new Date(prescription.prescribedAt).toLocaleDateString('vi-VN')}
                </Text>
              )}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Danh sách thuốc cần uống</Text>
              {prescription?.medications && prescription.medications.length > 0 ? (
                prescription.medications.map((med, index) => (
                  <View key={med._id} style={styles.medicationDetailBlock}>
                    <View style={styles.medHeader}>
                      <Ionicons name="medical" size={18} color={MedsTheme.colors.success} />
                      <Text style={styles.medNameText}>{index + 1}. {med.name}</Text>
                    </View>

                    <View style={styles.medMeta}>
                      <Text style={styles.metaLabel}>Liều lượng: <Text style={styles.metaValue}>{med.dosage}</Text></Text>
                      {med.form && <Text style={styles.metaLabel}>Dạng thuốc: <Text style={styles.metaValue}>{med.form}</Text></Text>}
                      {med.unit && <Text style={styles.metaLabel}>Đơn vị: <Text style={styles.metaValue}>{med.unit}</Text></Text>}
                      {med.usageNote && <Text style={styles.metaLabel}>Cách dùng: <Text style={styles.metaValue}>{med.usageNote}</Text></Text>}
                    </View>

                    {med.description && (
                      <Text style={styles.descriptionText}>
                        <Text style={styles.boldText}>Mô tả: </Text>{med.description}
                      </Text>
                    )}
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>Không có thuốc trong đơn này.</Text>
              )}
            </View>

            <View style={{ flexDirection: 'column', gap: 10, marginTop: 12, marginBottom: 12, width: '100%' }}>
              <Pressable style={styles.editButton} onPress={() => setIsEditing(true)}>
                <Ionicons name="create-outline" size={18} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.btnText}>Cập nhật đơn thuốc</Text>
              </Pressable>
              <Pressable style={styles.deleteButton} onPress={handleDeletePrescription}>
                <Ionicons name="trash-outline" size={18} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.btnText}>Xóa đơn thuốc</Text>
              </Pressable>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              style={styles.confirmButton}
              onPress={() => setFeedbackText('Đã xác nhận uống thuốc trong đơn thành công.')}>
              <Ionicons name="checkmark" size={18} color="#FFFFFF" />
              <Text style={styles.confirmText}>Xác nhận đã uống</Text>
            </Pressable>
            <FeedbackToast message={feedbackText} onHide={() => setFeedbackText(null)} />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: MedsTheme.colors.appBackground,
  },
  content: {
    padding: 16,
    gap: 12,
    paddingBottom: 28,
  },
  heroWrap: {
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 6,
  },
  heroOuter: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 2,
    borderColor: '#E0E8F4',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FBFF',
  },
  heroInner: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#D2DCEB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  tagPrimary: {
    backgroundColor: '#0C2A54',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagPrimaryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  tagSecondary: {
    backgroundColor: '#FFDEA8',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagSecondaryText: {
    color: '#764B00',
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    marginTop: 10,
    fontSize: 32,
    fontWeight: '800',
    color: MedsTheme.colors.textMain,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 4,
    color: MedsTheme.colors.textMuted,
    fontSize: 15,
    textAlign: 'center',
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: MedsTheme.colors.border,
    backgroundColor: MedsTheme.colors.card,
    padding: 16,
    gap: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: MedsTheme.colors.textMain,
    borderBottomWidth: 1,
    borderBottomColor: MedsTheme.colors.border,
    paddingBottom: 8,
    marginBottom: 4,
  },
  periodRow: {
    flexDirection: 'row',
    gap: 8,
  },
  periodBox: {
    flex: 1,
    minHeight: 64,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: MedsTheme.colors.border,
    backgroundColor: '#F4F7FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodBoxActive: {
    borderColor: '#5EA6FA',
    backgroundColor: '#2B8EFF',
  },
  periodLabel: {
    color: MedsTheme.colors.textMuted,
    fontWeight: '700',
  },
  periodLabelActive: {
    color: '#D8EBFF',
  },
  periodTime: {
    marginTop: 2,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  guideRow: {
    flexDirection: 'row',
    gap: 10,
  },
  guideIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  guideContent: {
    flex: 1,
  },
  guideMain: {
    color: MedsTheme.colors.textMain,
    fontWeight: '700',
    marginBottom: 2,
  },
  guideSub: {
    color: MedsTheme.colors.textMuted,
    lineHeight: 19,
    fontSize: 13,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#DCE5F3',
    backgroundColor: MedsTheme.colors.pageBackground,
    gap: 10,
  },
  remindButton: {
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D3E4FF',
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  remindText: {
    color: MedsTheme.colors.primaryDark,
    fontWeight: '600',
  },
  confirmButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: MedsTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 12,
  },
  loadingText: {
    marginTop: 10,
    color: MedsTheme.colors.textMuted,
    fontSize: 16,
  },
  errorText: {
    color: MedsTheme.colors.danger,
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: MedsTheme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 15,
    color: MedsTheme.colors.textMain,
  },
  boldText: {
    fontWeight: '700',
  },
  medicationDetailBlock: {
    borderBottomWidth: 1,
    borderBottomColor: MedsTheme.colors.border,
    paddingBottom: 12,
    marginBottom: 12,
    gap: 6,
  },
  medHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  medNameText: {
    fontSize: 16,
    fontWeight: '700',
    color: MedsTheme.colors.textMain,
  },
  medMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingLeft: 26,
  },
  metaLabel: {
    fontSize: 13,
    color: MedsTheme.colors.textMuted,
  },
  metaValue: {
    color: MedsTheme.colors.textMain,
    fontWeight: '600',
  },
  descriptionText: {
    fontSize: 14,
    color: MedsTheme.colors.textMuted,
    paddingLeft: 26,
    fontStyle: 'italic',
  },
  emptyText: {
    color: MedsTheme.colors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: MedsTheme.colors.textMain,
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: MedsTheme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: '#FFFFFF',
    color: MedsTheme.colors.textMain,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  editButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    backgroundColor: MedsTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  deleteButton: {
    height: 50,
    borderRadius: 12,
    backgroundColor: MedsTheme.colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#E4E9F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  cancelBtnText: {
    color: '#4F5E74',
    fontWeight: '700',
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
  },
  medSelectorList: {
    gap: 8,
    marginTop: 4,
  },
  medSelectorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FBFF',
    borderWidth: 1,
    borderColor: '#E4E9F2',
    borderRadius: 10,
    padding: 12,
  },
  medSelectorItemActive: {
    backgroundColor: '#EAF6FF',
    borderColor: '#A8D2FF',
  },
  medSelectorInfo: {
    flex: 1,
  },
  medSelectorName: {
    fontSize: 15,
    fontWeight: '600',
    color: MedsTheme.colors.textMain,
  },
  medSelectorNameActive: {
    color: '#005DCC',
  },
  medSelectorDesc: {
    fontSize: 12,
    color: MedsTheme.colors.textMuted,
    marginTop: 2,
  },
});

