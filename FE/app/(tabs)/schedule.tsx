import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, ActivityIndicator, Modal, Alert, Platform, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';

import { MedsTheme } from '@/constants/meds-theme';
import { useAuth } from '@/store/auth-store';

interface TimeSlot {
  time: string;
  dosageNote?: string;
}

interface PrescriptionInfo {
  _id: string;
  patientId?: string;
  createdBy?: string;
  title: string;
  prescribedAt?: string;
  startDate?: string;
  endDate?: string;
  doctorName?: string;
  note?: string;
  medications?: string[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface MedicationSchedule {
  _id: string;
  patientId: string;
  prescriptionId?: PrescriptionInfo;
  createdBy?: string;
  startDate: string;
  endDate?: string;
  frequencyType: 'daily' | 'weekly' | 'interval' | 'as_needed';
  timeSlots: TimeSlot[];
  daysOfWeek?: number[];
  intervalDays?: number;
  reminderMinutesBefore?: number;
  timezone?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const getFrequencyLabel = (type: string, daysOfWeek?: number[], intervalDays?: number) => {
  switch (type) {
    case 'daily':
      return 'Hàng ngày';
    case 'weekly':
      if (daysOfWeek && daysOfWeek.length > 0) {
        const daysMap: Record<number, string> = {
          0: 'Chủ Nhật',
          1: 'Thứ 2',
          2: 'Thứ 3',
          3: 'Thứ 4',
          4: 'Thứ 5',
          5: 'Thứ 6',
          6: 'Thứ 7',
        };
        const sortedDays = [...daysOfWeek].sort((a, b) => a - b);
        const daysStr = sortedDays.map((d) => daysMap[d] || `Thứ ${d + 1}`).join(', ');
        return `Hàng tuần (${daysStr})`;
      }
      return 'Hàng tuần';
    case 'interval':
      return `Mỗi ${intervalDays || 1} ngày`;
    case 'as_needed':
      return 'Khi cần thiết';
    default:
      return type;
  }
};

export default function ScheduleScreen() {
  const [schedules, setSchedules] = useState<MedicationSchedule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { accessToken, role } = useAuth();

  const [selectedSchedule, setSelectedSchedule] = useState<MedicationSchedule | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  
  const [isEditingDetail, setIsEditingDetail] = useState<boolean>(false);
  const [updateLoading, setUpdateLoading] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  // Form edit states
  const [editStartDate, setEditStartDate] = useState<string>('');
  const [editEndDate, setEditEndDate] = useState<string>('');
  const [editFrequencyType, setEditFrequencyType] = useState<string>('');
  const [editTimeSlotsStr, setEditTimeSlotsStr] = useState<string>('');
  const [editDaysOfWeekStr, setEditDaysOfWeekStr] = useState<string>('');
  const [editIntervalDays, setEditIntervalDays] = useState<string>('');
  const [editReminderMinutesBefore, setEditReminderMinutesBefore] = useState<string>('');
  const [editTimezone, setEditTimezone] = useState<string>('');

  const fetchSchedules = useCallback(async () => {
    if (!accessToken) {
      setSchedules([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const url = 'http://localhost:3000/api/v1/schedules/patient/6a3cef8fd789d8d7be4b7e47?page=1&limit=20';

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.data && response.data.data && response.data.data.schedules) {
        setSchedules(response.data.data.schedules);
      } else {
        setSchedules([]);
      }
    } catch (err: any) {
      console.error('Error fetching schedules:', err);
      setError(err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi tải lịch uống thuốc');
    } finally {
      setLoading(false);
    }
  }, [accessToken, role]);

  const fetchScheduleDetail = useCallback(async (id: string) => {
    if (!accessToken) return;
    try {
      setDetailLoading(true);
      const url = `http://localhost:3000/api/v1/schedules/${id}`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (response.data && response.data.data) {
        setSelectedSchedule(response.data.data);
        setModalVisible(true);
      }
    } catch (err: any) {
      console.error('Error fetching schedule detail:', err);
      // Fallback to local schedule if network request fails
      const localItem = schedules.find((s) => s._id === id);
      if (localItem) {
        setSelectedSchedule(localItem);
        setModalVisible(true);
      }
    } finally {
      setDetailLoading(false);
    }
  }, [accessToken, schedules]);

  const startEditing = useCallback(() => {
    if (!selectedSchedule) return;
    setEditStartDate(selectedSchedule.startDate ? selectedSchedule.startDate.substring(0, 10) : '');
    setEditEndDate(selectedSchedule.endDate ? selectedSchedule.endDate.substring(0, 10) : '');
    setEditFrequencyType(selectedSchedule.frequencyType || 'daily');
    
    const slotsStr = selectedSchedule.timeSlots
      .map((slot) => `${slot.time}${slot.dosageNote ? ` - ${slot.dosageNote}` : ''}`)
      .join(', ');
    setEditTimeSlotsStr(slotsStr);

    setEditDaysOfWeekStr((selectedSchedule.daysOfWeek || []).join(', '));
    setEditIntervalDays(selectedSchedule.intervalDays ? String(selectedSchedule.intervalDays) : '1');
    setEditReminderMinutesBefore(selectedSchedule.reminderMinutesBefore !== undefined ? String(selectedSchedule.reminderMinutesBefore) : '5');
    setEditTimezone(selectedSchedule.timezone || 'Asia/Ho_Chi_Minh');

    setIsEditingDetail(true);
  }, [selectedSchedule]);

  const handleUpdateSchedule = useCallback(async () => {
    if (!accessToken || !selectedSchedule) return;
    try {
      setUpdateLoading(true);
      const url = `http://localhost:3000/api/v1/schedules/${selectedSchedule._id}`;

      // Parse timeSlots
      const timeSlots = editTimeSlotsStr
        .split(',')
        .map((s) => {
          const parts = s.trim().split('-');
          return {
            time: parts[0]?.trim() || '08:00',
            dosageNote: parts[1]?.trim() || '',
          };
        })
        .filter((slot) => slot.time);

      // Parse daysOfWeek
      const daysOfWeek = editDaysOfWeekStr
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter((val) => !isNaN(val) && val >= 0 && val <= 6);

      const body = {
        startDate: editStartDate,
        endDate: editEndDate || undefined,
        frequencyType: editFrequencyType,
        timeSlots,
        daysOfWeek: daysOfWeek.length > 0 ? daysOfWeek : undefined,
        intervalDays: parseInt(editIntervalDays, 10) || undefined,
        reminderMinutesBefore: parseInt(editReminderMinutesBefore, 10) || 5,
        timezone: editTimezone,
      };

      const response = await axios.put(url, body, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data && response.data.status === 'success') {
        if (Platform.OS === 'web') {
          window.alert('Cập nhật lịch uống thuốc thành công!');
        } else {
          Alert.alert('Thành công', 'Cập nhật lịch uống thuốc thành công!');
        }
        setIsEditingDetail(false);
        // Refresh details modal with new data
        setSelectedSchedule(response.data.data);
        // Refresh main list
        fetchSchedules();
      } else {
        alert('Cập nhật lịch uống thuốc thất bại!');
      }
    } catch (err: any) {
      console.error('Error updating schedule:', err);
      const errMsg = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi cập nhật lịch thuốc';
      if (Platform.OS === 'web') {
        window.alert('Thất bại: ' + errMsg);
      } else {
        Alert.alert('Thất bại', errMsg);
      }
    } finally {
      setUpdateLoading(false);
    }
  }, [accessToken, selectedSchedule, editStartDate, editEndDate, editFrequencyType, editTimeSlotsStr, editDaysOfWeekStr, editIntervalDays, editReminderMinutesBefore, editTimezone, fetchSchedules]);

  const handleDeleteSchedule = useCallback(async () => {
    if (!accessToken || !selectedSchedule) return;

    const performDelete = async () => {
      try {
        setDeleteLoading(true);
        const url = `http://localhost:3000/api/v1/schedules/${selectedSchedule._id}`;
        const response = await axios.delete(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.data && response.data.status === 'success') {
          if (Platform.OS === 'web') {
            window.alert('Xóa lịch uống thuốc thành công!');
          } else {
            Alert.alert('Thành công', 'Xóa lịch uống thuốc thành công!');
          }
          setModalVisible(false);
          fetchSchedules();
        } else {
          alert('Xóa lịch uống thuốc thất bại!');
        }
      } catch (err: any) {
        console.error('Error deleting schedule:', err);
        const errMsg = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi xóa lịch thuốc';
        if (Platform.OS === 'web') {
          window.alert('Thất bại: ' + errMsg);
        } else {
          Alert.alert('Thất bại', errMsg);
        }
      } finally {
        setDeleteLoading(false);
      }
    };

    if (Platform.OS === 'web') {
      const confirm = window.confirm('Bạn có chắc chắn muốn xóa lịch uống thuốc này không?');
      if (confirm) {
        await performDelete();
      }
    } else {
      Alert.alert(
        'Xác nhận xóa',
        'Bạn có chắc chắn muốn xóa lịch uống thuốc này không?',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Xóa', style: 'destructive', onPress: performDelete },
        ]
      );
    }
  }, [accessToken, selectedSchedule, fetchSchedules]);

  useFocusEffect(
    useCallback(() => {
      fetchSchedules();
    }, [fetchSchedules])
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Lịch uống thuốc</Text>
        <Text style={styles.subtitle}>Theo dõi danh sách đơn thuốc và lịch uống thuốc của bệnh nhân.</Text>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={MedsTheme.colors.primary} />
            <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color={MedsTheme.colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={fetchSchedules}>
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </Pressable>
          </View>
        ) : schedules.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color={MedsTheme.colors.textMuted} />
            <Text style={styles.emptyText}>Bệnh nhân này chưa có lịch uống thuốc nào.</Text>
          </View>
        ) : (
          <View style={styles.timeline}>
            {schedules.map((item) => (
              <Pressable
                key={item._id}
                onPress={() => !detailLoading && fetchScheduleDetail(item._id)}
              >
                <View style={styles.prescriptionCard}>
                  <View style={styles.cardHeader}>
                    <View style={styles.titleContainer}>
                      <Ionicons name="document-text" size={20} color={MedsTheme.colors.primaryDark} />
                      <Text style={styles.cardTitle}>{item.prescriptionId?.title || 'Lịch uống thuốc'}</Text>
                    </View>
                    {item.prescriptionId?.doctorName && (
                      <Text style={styles.doctorText}>BS: {item.prescriptionId.doctorName}</Text>
                    )}
                  </View>

                  {item.prescriptionId?.note && (
                    <Text style={styles.noteText}>Ghi chú: {item.prescriptionId.note}</Text>
                  )}

                  <View style={styles.medicationsList}>
                    <Text style={styles.medicationSectionTitle}>Tần suất & Khung giờ:</Text>
                    <View style={styles.medicationRow}>
                      <Ionicons name="repeat" size={14} color={MedsTheme.colors.primary} />
                      <Text style={styles.medicationName}>
                        {getFrequencyLabel(item.frequencyType, item.daysOfWeek, item.intervalDays)}
                      </Text>
                    </View>
                    
                    {item.timeSlots.map((slot, idx) => (
                      <View key={idx} style={styles.medicationRow}>
                        <Ionicons name="time-outline" size={14} color={MedsTheme.colors.success} />
                        <Text style={styles.medicationName}>
                          {slot.time} - <Text style={styles.medicationDose}>{slot.dosageNote || 'Không có ghi chú liều'}</Text>
                        </Text>
                      </View>
                    ))}
                  </View>

                  {(item.startDate || item.endDate) && (
                    <View style={styles.dateContainer}>
                      <Ionicons name="calendar-outline" size={14} color={MedsTheme.colors.textMuted} />
                      <Text style={styles.dateText}>
                        Thời gian: {item.startDate ? new Date(item.startDate).toLocaleDateString('vi-VN') : 'N/A'} - {item.endDate ? new Date(item.endDate).toLocaleDateString('vi-VN') : 'N/A'}
                      </Text>
                    </View>
                  )}
                </View>
              </Pressable>
            ))}
          </View>
        )}

        <Pressable style={styles.primaryButton} onPress={() => router.push('/medicines/new')}>
          <Ionicons name="add-circle" size={18} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>Thêm lịch uống thuốc</Text>
        </Pressable>
      </ScrollView>

      {/* Modal chi tiết lịch */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setIsEditingDetail(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isEditingDetail ? 'Chỉnh sửa lịch uống' : 'Chi tiết lịch uống thuốc'}
              </Text>
              <Pressable
                onPress={() => {
                  setModalVisible(false);
                  setIsEditingDetail(false);
                }}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={MedsTheme.colors.textMain} />
              </Pressable>
            </View>

            {selectedSchedule && (
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                {isEditingDetail ? (
                  // EDIT MODE FORM
                  <View style={styles.editFormContainer}>
                    <View style={styles.inputWrapper}>
                      <Text style={styles.inputLabel}>Ngày bắt đầu (startDate)</Text>
                      <TextInput
                        style={styles.textInput}
                        value={editStartDate}
                        onChangeText={setEditStartDate}
                        placeholder="YYYY-MM-DD"
                      />
                    </View>

                    <View style={styles.inputWrapper}>
                      <Text style={styles.inputLabel}>Ngày kết thúc (endDate)</Text>
                      <TextInput
                        style={styles.textInput}
                        value={editEndDate}
                        onChangeText={setEditEndDate}
                        placeholder="YYYY-MM-DD"
                      />
                    </View>

                    <View style={styles.inputWrapper}>
                      <Text style={styles.inputLabel}>Tần suất (frequencyType)</Text>
                      <TextInput
                        style={styles.textInput}
                        value={editFrequencyType}
                        onChangeText={setEditFrequencyType}
                        placeholder="daily, weekly, interval, as_needed"
                      />
                    </View>

                    <View style={styles.inputWrapper}>
                      <Text style={styles.inputLabel}>Khung giờ uống (time - dosageNote, cách nhau bằng dấu phẩy)</Text>
                      <TextInput
                        style={[styles.textInput, styles.multilineInput]}
                        value={editTimeSlotsStr}
                        onChangeText={setEditTimeSlotsStr}
                        placeholder="08:00 - Uống sau ăn, 20:00"
                        multiline
                      />
                    </View>

                    <View style={styles.inputWrapper}>
                      <Text style={styles.inputLabel}>Các ngày trong tuần (daysOfWeek - cách nhau bằng dấu phẩy)</Text>
                      <TextInput
                        style={styles.textInput}
                        value={editDaysOfWeekStr}
                        onChangeText={setEditDaysOfWeekStr}
                        placeholder="0 (CN) -> 6 (T7)"
                      />
                    </View>

                    <View style={styles.inputWrapper}>
                      <Text style={styles.inputLabel}>Khoảng cách ngày (intervalDays)</Text>
                      <TextInput
                        style={styles.textInput}
                        value={editIntervalDays}
                        onChangeText={setEditIntervalDays}
                        placeholder="1"
                      />
                    </View>

                    <View style={styles.inputWrapper}>
                      <Text style={styles.inputLabel}>Số phút nhắc trước</Text>
                      <TextInput
                        style={styles.textInput}
                        value={editReminderMinutesBefore}
                        onChangeText={setEditReminderMinutesBefore}
                        placeholder="5"
                      />
                    </View>

                    <View style={styles.inputWrapper}>
                      <Text style={styles.inputLabel}>Múi giờ (timezone)</Text>
                      <TextInput
                        style={styles.textInput}
                        value={editTimezone}
                        onChangeText={setEditTimezone}
                        placeholder="Asia/Ho_Chi_Minh"
                      />
                    </View>
                  </View>
                ) : (
                  // VIEW DETAILS MODE
                  <>
                    <View style={styles.detailSection}>
                      <Text style={styles.sectionTitle}>Thông tin đơn thuốc</Text>
                      <View style={styles.detailRow}>
                        <Ionicons name="document-text-outline" size={16} color={MedsTheme.colors.primary} />
                        <Text style={styles.detailText}>
                          <Text style={styles.detailLabel}>Tên đơn: </Text>
                          {selectedSchedule.prescriptionId?.title || 'Chưa đặt tên'}
                        </Text>
                      </View>
                      {selectedSchedule.prescriptionId?.doctorName && (
                        <View style={styles.detailRow}>
                          <Ionicons name="person-outline" size={16} color={MedsTheme.colors.primary} />
                          <Text style={styles.detailText}>
                            <Text style={styles.detailLabel}>Bác sĩ: </Text>
                            {selectedSchedule.prescriptionId.doctorName}
                          </Text>
                        </View>
                      )}
                      {selectedSchedule.prescriptionId?.note && (
                        <View style={styles.detailRow}>
                          <Ionicons name="reader-outline" size={16} color={MedsTheme.colors.primary} />
                          <Text style={styles.detailText}>
                            <Text style={styles.detailLabel}>Ghi chú đơn: </Text>
                            {selectedSchedule.prescriptionId.note}
                          </Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.detailSection}>
                      <Text style={styles.sectionTitle}>Thông tin lịch uống</Text>
                      <View style={styles.detailRow}>
                        <Ionicons name="repeat" size={16} color={MedsTheme.colors.primary} />
                        <Text style={styles.detailText}>
                          <Text style={styles.detailLabel}>Tần suất: </Text>
                          {getFrequencyLabel(
                            selectedSchedule.frequencyType,
                            selectedSchedule.daysOfWeek,
                            selectedSchedule.intervalDays
                          )}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Ionicons name="calendar-outline" size={16} color={MedsTheme.colors.primary} />
                        <Text style={styles.detailText}>
                          <Text style={styles.detailLabel}>Thời gian: </Text>
                          {selectedSchedule.startDate ? new Date(selectedSchedule.startDate).toLocaleDateString('vi-VN') : 'N/A'} - {selectedSchedule.endDate ? new Date(selectedSchedule.endDate).toLocaleDateString('vi-VN') : 'N/A'}
                        </Text>
                      </View>
                      {selectedSchedule.reminderMinutesBefore !== undefined && (
                        <View style={styles.detailRow}>
                          <Ionicons name="notifications-outline" size={16} color={MedsTheme.colors.primary} />
                          <Text style={styles.detailText}>
                            <Text style={styles.detailLabel}>Nhắc trước: </Text>
                            {selectedSchedule.reminderMinutesBefore} phút
                          </Text>
                        </View>
                      )}
                      {selectedSchedule.timezone && (
                        <View style={styles.detailRow}>
                          <Ionicons name="globe-outline" size={16} color={MedsTheme.colors.primary} />
                          <Text style={styles.detailText}>
                            <Text style={styles.detailLabel}>Múi giờ: </Text>
                            {selectedSchedule.timezone}
                          </Text>
                        </View>
                      )}
                      <View style={styles.detailRow}>
                        <Ionicons name="checkmark-circle-outline" size={16} color={MedsTheme.colors.primary} />
                        <Text style={styles.detailText}>
                          <Text style={styles.detailLabel}>Trạng thái: </Text>
                          {selectedSchedule.isActive ? 'Đang hoạt động' : 'Đã ngưng hoạt động'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.detailSection}>
                      <Text style={styles.sectionTitle}>Khung giờ & Liều lượng</Text>
                      {selectedSchedule.timeSlots.map((slot, index) => (
                        <View key={index} style={styles.timeSlotItem}>
                          <Ionicons name="time" size={18} color={MedsTheme.colors.success} />
                          <View style={styles.timeSlotInfo}>
                            <Text style={styles.timeSlotTime}>{slot.time}</Text>
                            {slot.dosageNote && (
                              <Text style={styles.timeSlotNote}>{slot.dosageNote}</Text>
                            )}
                          </View>
                        </View>
                      ))}
                    </View>
                  </>
                )}
              </ScrollView>
            )}

            {/* BUTTONS BAR */}
            {isEditingDetail ? (
              <View style={styles.modalButtonsRow}>
                <Pressable
                  style={[styles.modalButton, styles.cancelBtn]}
                  onPress={() => setIsEditingDetail(false)}
                  disabled={updateLoading}
                >
                  <Text style={styles.cancelBtnText}>Hủy</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalButton, styles.saveBtn]}
                  onPress={handleUpdateSchedule}
                  disabled={updateLoading}
                >
                  {updateLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.saveBtnText}>Lưu</Text>
                  )}
                </Pressable>
              </View>
            ) : (
              <View style={styles.modalButtonsRow}>
                <Pressable
                  style={[styles.modalButton, styles.deleteBtn]}
                  onPress={handleDeleteSchedule}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.deleteBtnText}>Xóa lịch thuốc</Text>
                  )}
                </Pressable>
                <Pressable
                  style={[styles.modalButton, styles.updateBtn]}
                  onPress={startEditing}
                  disabled={deleteLoading}
                >
                  <Text style={styles.updateBtnText}>Cập nhật</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {(detailLoading || updateLoading || deleteLoading) && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={MedsTheme.colors.primary} />
          <Text style={styles.loadingText}>
            {detailLoading ? 'Đang tải chi tiết...' : updateLoading ? 'Đang cập nhật...' : 'Đang xóa...'}
          </Text>
        </View>
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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  title: {
    fontSize: 29,
    fontWeight: '800',
    color: MedsTheme.colors.textMain,
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 18,
    color: MedsTheme.colors.textMuted,
    fontSize: 15,
  },
  timeline: {
    gap: 12,
  },
  centerContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: MedsTheme.colors.textMuted,
    fontSize: 15,
  },
  errorContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
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
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyText: {
    color: MedsTheme.colors.textMuted,
    fontSize: 16,
  },
  prescriptionCard: {
    backgroundColor: MedsTheme.colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: MedsTheme.colors.border,
    padding: 16,
    shadowColor: MedsTheme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: MedsTheme.colors.border,
    paddingBottom: 8,
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardTitle: {
    color: MedsTheme.colors.textMain,
    fontWeight: '700',
    fontSize: 16,
  },
  doctorText: {
    fontSize: 13,
    color: MedsTheme.colors.textMuted,
    fontStyle: 'italic',
  },
  noteText: {
    fontSize: 14,
    color: MedsTheme.colors.warning,
    marginBottom: 10,
  },
  medicationsList: {
    gap: 6,
    marginBottom: 10,
  },
  medicationSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: MedsTheme.colors.textMain,
    marginBottom: 4,
  },
  medicationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  medicationName: {
    fontSize: 14,
    color: MedsTheme.colors.textMain,
    fontWeight: '500',
  },
  medicationDose: {
    color: MedsTheme.colors.textMuted,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 12,
    color: MedsTheme.colors.textMuted,
  },
  primaryButton: {
    marginTop: 26,
    borderRadius: 12,
    height: 48,
    backgroundColor: MedsTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: MedsTheme.colors.card,
    borderRadius: 16,
    width: '100%',
    maxHeight: '80%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: MedsTheme.colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: MedsTheme.colors.border,
    paddingBottom: 12,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: MedsTheme.colors.textMain,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    marginBottom: 20,
  },
  detailSection: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: MedsTheme.colors.border,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: MedsTheme.colors.primary,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: MedsTheme.colors.textMain,
    flex: 1,
  },
  detailLabel: {
    fontWeight: '600',
    color: MedsTheme.colors.textMuted,
  },
  timeSlotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: MedsTheme.colors.appBackground,
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: MedsTheme.colors.border,
  },
  timeSlotInfo: {
    flex: 1,
  },
  timeSlotTime: {
    fontSize: 15,
    fontWeight: '700',
    color: MedsTheme.colors.textMain,
  },
  timeSlotNote: {
    fontSize: 12,
    color: MedsTheme.colors.textMuted,
    marginTop: 2,
  },
  modalCloseButton: {
    backgroundColor: MedsTheme.colors.primary,
    borderRadius: 10,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  editFormContainer: {
    gap: 12,
  },
  inputWrapper: {
    gap: 6,
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: MedsTheme.colors.textMuted,
  },
  textInput: {
    borderWidth: 1,
    borderColor: MedsTheme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: MedsTheme.colors.textMain,
    backgroundColor: MedsTheme.colors.appBackground,
  },
  multilineInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: MedsTheme.colors.appBackground,
    borderWidth: 1,
    borderColor: MedsTheme.colors.border,
  },
  cancelBtnText: {
    color: MedsTheme.colors.textMain,
    fontSize: 16,
    fontWeight: '700',
  },
  saveBtn: {
    backgroundColor: MedsTheme.colors.success,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  deleteBtn: {
    backgroundColor: MedsTheme.colors.danger,
  },
  deleteBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  updateBtn: {
    backgroundColor: MedsTheme.colors.primary,
  },
  updateBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
});
