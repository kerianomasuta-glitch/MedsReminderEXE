import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { MedicineForm } from '@/components/meds/medicine-form';
import { ActionButton, AppScreen, PageHeader, SectionCard } from '@/components/meds/ui-kit';
import { MedsTheme } from '@/constants/meds-theme';

type ConfirmType = 'none' | 'delete' | 'pause';

export default function EditMedicineScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [confirmType, setConfirmType] = useState<ConfirmType>('none');

  const confirmText =
    confirmType === 'delete'
      ? 'Bạn có chắc muốn xóa thuốc này? Dữ liệu lịch uống sẽ bị gỡ khỏi danh sách.'
      : 'Bạn có chắc muốn tạm dừng lịch thuốc này?';

  return (
    <AppScreen paddedBottom={44}>
      <PageHeader title="Chỉnh sửa thuốc" subtitle="Cập nhật thông tin và quản lý trạng thái lịch thuốc." />
      <MedicineForm
        mode="edit"
        medicineId={id}
        onSubmit={() => router.back()}
        onCancel={() => router.back()}
        onPause={() => setConfirmType('pause')}
        onDelete={() => setConfirmType('delete')}
      />

      <Modal animationType="fade" transparent visible={confirmType !== 'none'} onRequestClose={() => setConfirmType('none')}>
        <View style={styles.overlay}>
          <SectionCard style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Ionicons
                name={confirmType === 'delete' ? 'trash' : 'pause-circle'}
                size={22}
                color={confirmType === 'delete' ? MedsTheme.colors.danger : '#B7791F'}
              />
              <Text style={styles.modalTitle}>{confirmType === 'delete' ? 'Xác nhận xóa thuốc' : 'Tạm dừng lịch thuốc'}</Text>
            </View>
            <Text style={styles.modalText}>{confirmText}</Text>
            <ActionButton
              label={confirmType === 'delete' ? 'Xác nhận xóa' : 'Xác nhận tạm dừng'}
              tone={confirmType === 'delete' ? 'danger' : 'warning'}
              onPress={() => {
                setConfirmType('none');
                router.back();
              }}
            />
            <Pressable style={styles.cancelTextWrap} onPress={() => setConfirmType('none')}>
              <Text style={styles.cancelText}>Đóng</Text>
            </Pressable>
          </SectionCard>
        </View>
      </Modal>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 20, 38, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  modalCard: {
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    flex: 1,
    color: MedsTheme.colors.textMain,
    fontSize: 18,
    fontWeight: '800',
  },
  modalText: {
    color: MedsTheme.colors.textMuted,
    lineHeight: 20,
  },
  cancelTextWrap: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  cancelText: {
    color: MedsTheme.colors.primaryDark,
    fontWeight: '700',
  },
});
