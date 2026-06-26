import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View, ActivityIndicator, Alert, Platform } from 'react-native';
import axios from 'axios';

import { AppScreen, PageHeader, TextField } from '@/components/meds/ui-kit';
import { MedsTheme } from '@/constants/meds-theme';
import { useAuth } from '@/store/auth-store';

export default function NewMedicineScreen() {
  const [patientId, setPatientId] = useState('6a3cef8fd789d8d7be4b7e47');
  const [title, setTitle] = useState('Đơn huyết áp cao');
  const [medicationsStr, setMedicationsStr] = useState(
    '6a3d4baf1ba1cfe8472e0709, 6a3d4c1b1ba1cfe8472e070b'
  );
  const [startDate, setStartDate] = useState('2026-06-25');
  const [endDate, setEndDate] = useState('2026-07-25');
  const [prescribedAt, setPrescribedAt] = useState('2026-06-25');
  const [doctorName, setDoctorName] = useState('BS. Nguyễn Văn A');
  const [note, setNote] = useState('Uống sau ăn 30 phút');

  const [loading, setLoading] = useState(false);

  const { accessToken, role } = useAuth();

  const handleSubmit = async () => {
    if (!accessToken) {
      Alert.alert('Lỗi', 'Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn.');
      return;
    }
    setLoading(true);
    try {
      const url = 'http://localhost:3000/api/v1/prescriptions';

      // Parse comma-separated list of medications
      const medications = medicationsStr
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);

      const body = {
        patientId,
        title,
        medications,
        startDate,
        endDate,
        prescribedAt,
        doctorName,
        note,
      };

      console.log('Sending PUT to create schedule:', body);

      const response = await axios.post(url, body, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Create schedule response:', response.data);
      if (Platform.OS === 'web') {
        window.alert('Lưu lịch uống thuốc mới thành công!');
        router.replace('/prescriptions');
      } else {
        Alert.alert('Thành công', 'Lưu lịch uống thuốc mới thành công!', [
          {
            text: 'OK',
            onPress: () => router.replace('/prescriptions'),
          },
        ]);
      }
    } catch (err: any) {
      console.error('Error saving schedule:', err);
      const errMsg = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi lưu lịch thuốc';
      if (Platform.OS === 'web') {
        window.alert('Thất bại: ' + errMsg);
      } else {
        Alert.alert('Thất bại', errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppScreen paddedBottom={44}>
      <PageHeader title="Thêm lịch uống thuốc" subtitle="Nhập đầy đủ thông tin để tạo lịch uống thuốc mới cho bệnh nhân." />
      
      <View style={styles.formContainer}>
        <TextField
          label="Mã bệnh nhân (patientId)"
          value={patientId}
          onChangeText={setPatientId}
          placeholder="Mã patientId"
        />

        <TextField
          label="Tiêu đề đơn thuốc (title)"
          value={title}
          onChangeText={setTitle}
          placeholder="Tiêu đề"
        />

        <TextField
          label="Danh sách ID thuốc (medications - cách nhau bằng dấu phẩy)"
          value={medicationsStr}
          onChangeText={setMedicationsStr}
          placeholder="ID thuốc 1, ID thuốc 2"
          multiline
        />

        <View style={styles.row}>
          <View style={styles.col}>
            <TextField
              label="Ngày bắt đầu (startDate)"
              value={startDate}
              onChangeText={setStartDate}
              placeholder="YYYY-MM-DD"
            />
          </View>
          <View style={styles.col}>
            <TextField
              label="Ngày kết thúc (endDate)"
              value={endDate}
              onChangeText={setEndDate}
              placeholder="YYYY-MM-DD"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.col}>
            <TextField
              label="Ngày kê đơn (prescribedAt)"
              value={prescribedAt}
              onChangeText={setPrescribedAt}
              placeholder="YYYY-MM-DD"
            />
          </View>
          <View style={styles.col}>
            <TextField
              label="Bác sĩ kê đơn (doctorName)"
              value={doctorName}
              onChangeText={setDoctorName}
              placeholder="Tên bác sĩ"
            />
          </View>
        </View>

        <TextField
          label="Ghi chú uống thuốc (note)"
          value={note}
          onChangeText={setNote}
          placeholder="Ví dụ: Uống sau ăn 30 phút"
        />

        <View style={styles.buttonRow}>
          <Pressable style={styles.cancelButton} onPress={() => router.back()} disabled={loading}>
            <Text style={styles.cancelButtonText}>Hủy</Text>
          </Pressable>
          <Pressable style={styles.saveButton} onPress={handleSubmit} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Lưu lịch uống thuốc</Text>
            )}
          </Pressable>
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    backgroundColor: MedsTheme.colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: MedsTheme.colors.border,
    padding: 16,
    gap: 12,
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
    marginTop: 18,
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
    fontWeight: '700',
  },
  saveButton: {
    flex: 2,
    height: 48,
    borderRadius: 12,
    backgroundColor: MedsTheme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
