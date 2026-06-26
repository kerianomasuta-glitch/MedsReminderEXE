import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View, ActivityIndicator, Alert, Platform } from 'react-native';
import axios from 'axios';

import { AppScreen, PageHeader, TextField } from '@/components/meds/ui-kit';
import { MedsTheme } from '@/constants/meds-theme';
import { useAuth } from '@/store/auth-store';

export default function NewMedicineScreen() {
  const [patientId, setPatientId] = useState('6a3cef8fd789d8d7be4b7e47');
  const [prescriptionId, setPrescriptionId] = useState('6a3ddb07c2a4e34da0d6e9cc');
  const [startDate, setStartDate] = useState('2026-06-25');
  const [endDate, setEndDate] = useState('2026-07-25');
  const [frequencyType, setFrequencyType] = useState('daily');
  const [timeSlotsStr, setTimeSlotsStr] = useState('08:00 - Uống sau ăn');
  const [daysOfWeekStr, setDaysOfWeekStr] = useState('3');
  const [intervalDays, setIntervalDays] = useState('1');
  const [reminderMinutesBefore, setReminderMinutesBefore] = useState('5');
  const [timezone, setTimezone] = useState('Asia/Ho_Chi_Minh');

  const [loading, setLoading] = useState(false);
  const { accessToken } = useAuth();

  const handleSubmit = async () => {
    if (!accessToken) {
      Alert.alert('Lỗi', 'Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn.');
      return;
    }
    setLoading(true);
    try {
      const url = 'http://localhost:3000/api/v1/schedules';

      // Parse comma-separated list of timeSlots, e.g. "08:00 - Uống sau ăn, 20:00 - Trước đi ngủ"
      const timeSlots = timeSlotsStr
        .split(',')
        .map((s) => {
          const parts = s.trim().split('-');
          return {
            time: parts[0]?.trim() || '08:00',
            dosageNote: parts[1]?.trim() || '',
          };
        })
        .filter((slot) => slot.time);

      // Parse comma-separated list of daysOfWeek, e.g. "1, 3, 5"
      const daysOfWeek = daysOfWeekStr
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter((val) => !isNaN(val) && val >= 0 && val <= 6);

      const body = {
        patientId,
        prescriptionId,
        startDate,
        endDate: endDate || undefined,
        frequencyType,
        timeSlots,
        daysOfWeek: daysOfWeek.length > 0 ? daysOfWeek : undefined,
        intervalDays: parseInt(intervalDays, 10) || undefined,
        reminderMinutesBefore: parseInt(reminderMinutesBefore, 10) || 5,
        timezone,
      };

      console.log('Sending POST to create schedule:', body);

      const response = await axios.post(url, body, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Create schedule response:', response.data);
      if (Platform.OS === 'web') {
        window.alert('Lưu lịch uống thuốc mới thành công!');
        router.replace('/schedule');
      } else {
        Alert.alert('Thành công', 'Lưu lịch uống thuốc mới thành công!', [
          {
            text: 'OK',
            onPress: () => router.replace('/schedule'),
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
          label="Mã đơn thuốc (prescriptionId)"
          value={prescriptionId}
          onChangeText={setPrescriptionId}
          placeholder="Mã đơn thuốc"
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
              label="Tần suất (frequencyType)"
              value={frequencyType}
              onChangeText={setFrequencyType}
              placeholder="daily, weekly, interval, as_needed"
            />
          </View>
          <View style={styles.col}>
            <TextField
              label="Số phút nhắc trước"
              value={reminderMinutesBefore}
              onChangeText={setReminderMinutesBefore}
              placeholder="5"
            />
          </View>
        </View>

        <TextField
          label="Khung giờ uống (time - dosageNote, cách nhau bằng dấu phẩy)"
          value={timeSlotsStr}
          onChangeText={setTimeSlotsStr}
          placeholder="08:00 - Uống sau ăn, 12:00 - Uống trước ăn"
          multiline
        />

        <View style={styles.row}>
          <View style={styles.col}>
            <TextField
              label="Các ngày trong tuần (daysOfWeek - cách nhau bằng dấu phẩy)"
              value={daysOfWeekStr}
              onChangeText={setDaysOfWeekStr}
              placeholder="0 (CN) -> 6 (T7)"
            />
          </View>
          <View style={styles.col}>
            <TextField
              label="Khoảng cách ngày (intervalDays)"
              value={intervalDays}
              onChangeText={setIntervalDays}
              placeholder="1"
            />
          </View>
        </View>

        <TextField
          label="Múi giờ (timezone)"
          value={timezone}
          onChangeText={setTimezone}
          placeholder="Asia/Ho_Chi_Minh"
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
