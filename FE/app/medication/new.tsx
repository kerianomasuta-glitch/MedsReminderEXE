import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, ActivityIndicator, TextInput, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';

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

export default function NewPrescriptionScreen() {
  const [patientId, setPatientId] = useState('6a3cef8fd789d8d7be4b7e47');
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('2026-06-25');
  const [endDate, setEndDate] = useState('2026-07-25');
  const [prescribedAt, setPrescribedAt] = useState('2026-06-25');
  const [doctorName, setDoctorName] = useState('BS. Nguyễn Văn A');
  const [note, setNote] = useState('Uống sau ăn 30 phút');

  const [selectedMedIds, setSelectedMedIds] = useState<string[]>([]);
  const [allMedications, setAllMedications] = useState<Medication[]>([]);
  const [medicationsLoading, setMedicationsLoading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { accessToken } = useAuth();

  const fetchAllMedications = useCallback(async () => {
    if (!accessToken) return;
    try {
      setMedicationsLoading(true);
      const url = `http://localhost:3000/api/v1/medications/patient/${patientId}?page=1&limit=20`;
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
  }, [accessToken, patientId]);

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
    fetchAllMedications();
  }, [fetchAllMedications]);

  const handleSubmit = async () => {
    if (!accessToken) {
      if (Platform.OS === 'web') {
        window.alert('Phiên đăng nhập đã hết hạn.');
      } else {
        Alert.alert('Lỗi', 'Phiên đăng nhập đã hết hạn.');
      }
      return;
    }

    if (!title.trim()) {
      if (Platform.OS === 'web') {
        window.alert('Vui lòng nhập tên đơn thuốc.');
      } else {
        Alert.alert('Lỗi', 'Vui lòng nhập tên đơn thuốc.');
      }
      return;
    }

    try {
      setLoading(true);
      const url = 'http://localhost:3000/api/v1/prescriptions';
      const body = {
        patientId,
        title: title.trim(),
        medications: selectedMedIds,
        startDate: startDate.trim(),
        endDate: endDate.trim(),
        prescribedAt: prescribedAt.trim(),
        doctorName: doctorName.trim(),
        note: note.trim()
      };

      console.log('Sending POST to create prescription:', body);
      const response = await axios.post(url, body, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Create prescription response:', response.data);
      if (Platform.OS === 'web') {
        window.alert('Thêm đơn thuốc mới thành công!');
        router.replace('/prescriptions');
      } else {
        Alert.alert('Thành công', 'Thêm đơn thuốc mới thành công!', [
          {
            text: 'OK',
            onPress: () => router.replace('/prescriptions'),
          },
        ]);
      }
    } catch (err: any) {
      console.error('Error creating prescription:', err);
      const errMsg = err?.response?.data?.message || err?.message || 'Không thể tạo đơn thuốc mới';
      if (Platform.OS === 'web') {
        window.alert('Lỗi: ' + errMsg);
      } else {
        Alert.alert('Lỗi', errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Thêm đơn thuốc mới',
        }}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tạo đơn thuốc mới</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mã bệnh nhân (patientId)</Text>
            <TextInput
              style={styles.textInput}
              value={patientId}
              onChangeText={setPatientId}
              placeholder="Nhập mã bệnh nhân"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Tên đơn thuốc</Text>
            <TextInput
              style={styles.textInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Nhập tên đơn thuốc"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Bác sĩ chỉ định</Text>
            <TextInput
              style={styles.textInput}
              value={doctorName}
              onChangeText={setDoctorName}
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
              value={startDate}
              onChangeText={setStartDate}
              placeholder="2026-06-25"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Ngày kết thúc (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.textInput}
              value={endDate}
              onChangeText={setEndDate}
              placeholder="2026-07-25"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Ngày kê đơn (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.textInput}
              value={prescribedAt}
              onChangeText={setPrescribedAt}
              placeholder="2026-06-25"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Ghi chú</Text>
            <TextInput
              style={[styles.textInput, { height: 80, textAlignVertical: 'top' }]}
              value={note}
              onChangeText={setNote}
              placeholder="Nhập ghi chú"
              multiline
            />
          </View>

          <View style={styles.actionRow}>
            <Pressable
              style={styles.cancelButton}
              onPress={() => router.back()}
              disabled={loading}>
              <Text style={styles.cancelBtnText}>Hủy</Text>
            </Pressable>
            <Pressable
              style={styles.editButton}
              onPress={handleSubmit}
              disabled={loading}>
              <Text style={styles.btnText}>
                {loading ? 'Đang lưu...' : 'Lưu đơn thuốc'}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
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
    flex: 2,
    height: 50,
    borderRadius: 12,
    backgroundColor: MedsTheme.colors.primary,
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
  emptyText: {
    color: MedsTheme.colors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
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
