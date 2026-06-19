import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { medicineMock, medicineTypeOptions, usageNoteOptions } from '@/constants/app-mock';
import { MedsTheme } from '@/constants/meds-theme';

import { ActionButton, ChoiceChip, FieldLabel, SectionCard, TextField } from './ui-kit';

type MedicineFormMode = 'create' | 'edit';

type MedicineFormProps = {
  mode: MedicineFormMode;
  medicineId?: string;
  onSubmit?: () => void;
  onCancel?: () => void;
  onPause?: () => void;
  onDelete?: () => void;
};

const stepTitles = ['Thông tin thuốc', 'Lịch uống', 'Hướng dẫn sử dụng'] as const;

export function MedicineForm({ mode, medicineId, onSubmit, onCancel, onPause, onDelete }: MedicineFormProps) {
  const medication = useMemo(
    () => medicineMock.find((item) => item.id === medicineId) ?? medicineMock[0],
    [medicineId],
  );
  const initialFormType = medicineTypeOptions.includes(medication.form as (typeof medicineTypeOptions)[number])
    ? (medication.form as (typeof medicineTypeOptions)[number])
    : 'Viên nén';
  const initialUsageNote = usageNoteOptions.includes(medication.usageNote as (typeof usageNoteOptions)[number])
    ? (medication.usageNote as (typeof usageNoteOptions)[number])
    : 'Sau ăn';

  const [name, setName] = useState(mode === 'edit' ? medication.name : '');
  const [dose, setDose] = useState(mode === 'edit' ? medication.dose : '');
  const [times, setTimes] = useState(mode === 'edit' ? `${medication.time}, 08:00 PM` : '07:00 AM, 01:00 PM, 06:00 PM');
  const [instructions, setInstructions] = useState('Uống với nhiều nước. Không uống cùng sữa.');
  const [formType, setFormType] = useState<(typeof medicineTypeOptions)[number]>(
    mode === 'edit' ? initialFormType : 'Viên nén',
  );
  const [usage, setUsage] = useState<(typeof usageNoteOptions)[number]>(mode === 'edit' ? initialUsageNote : 'Sau ăn');
  const [openEnd, setOpenEnd] = useState(mode === 'create');
  const [errors, setErrors] = useState<{ name?: string; dose?: string; times?: string }>({});

  const validate = () => {
    const next: { name?: string; dose?: string; times?: string } = {};
    if (!name.trim()) next.name = 'Vui lòng nhập tên thuốc.';
    if (!dose.trim()) next.dose = 'Vui lòng nhập liều lượng.';
    if (!times.trim()) next.times = 'Vui lòng thêm ít nhất 1 khung giờ uống.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      return;
    }
    onSubmit?.();
  };

  return (
    <>
      <SectionCard>
        <View style={styles.stepRow}>
          {stepTitles.map((title, index) => (
            <View key={title} style={styles.stepItem}>
              <View style={styles.stepDot}>
                <Text style={styles.stepNumber}>{index + 1}</Text>
              </View>
              <Text style={styles.stepLabel}>{title}</Text>
            </View>
          ))}
        </View>
      </SectionCard>

      <SectionCard>
        <FieldLabel text="1. Thông tin thuốc" />
        <TextField
          label="Tên thuốc"
          value={name}
          onChangeText={setName}
          placeholder="Ví dụ: Paracetamol 500mg"
          error={errors.name}
        />

        <FieldLabel text="Loại thuốc" />
        <View style={styles.grid}>
          {medicineTypeOptions.map((item) => (
            <ChoiceChip key={item} label={item} active={item === formType} onPress={() => setFormType(item)} />
          ))}
        </View>

        <TextField
          label="Liều lượng mỗi lần"
          value={dose}
          onChangeText={setDose}
          placeholder="Ví dụ: 1 viên / 10ml"
          error={errors.dose}
        />
      </SectionCard>

      <SectionCard>
        <FieldLabel text="2. Lịch uống" />
        <TextField label="Số lần uống trong ngày" value="3 lần/ngày" editable={false} />
        <TextField
          label="Thời gian uống (phân tách dấu phẩy)"
          value={times}
          onChangeText={setTimes}
          placeholder="07:00 AM, 01:00 PM, 06:00 PM"
          error={errors.times}
        />
        <TextField label="Ngày bắt đầu" value="2026-06-01" editable={false} />

        <Pressable
          onPress={() => setOpenEnd((prev) => !prev)}
          style={({ pressed, hovered }) => [styles.toggleRow, (pressed || hovered) && styles.toggleHover]}>
          <Ionicons name={openEnd ? 'checkbox' : 'square-outline'} size={18} color={MedsTheme.colors.primaryDark} />
          <Text style={styles.toggleText}>Không có ngày kết thúc</Text>
        </Pressable>
      </SectionCard>

      <SectionCard>
        <FieldLabel text="3. Hướng dẫn sử dụng" />
        <FieldLabel text="Ghi chú sử dụng" />
        <View style={styles.grid}>
          {usageNoteOptions.map((item) => (
            <ChoiceChip key={item} label={item} active={item === usage} onPress={() => setUsage(item)} />
          ))}
        </View>
        <TextField
          label="Hướng dẫn thêm"
          value={instructions}
          onChangeText={setInstructions}
          multiline
          numberOfLines={4}
          style={styles.multiline}
        />
      </SectionCard>

      <SectionCard>
        <Text style={styles.previewTitle}>Preview trên Home</Text>
        <View style={styles.previewCard}>
          <View style={styles.previewLeft}>
            <Ionicons name="medical" size={18} color={MedsTheme.colors.primaryDark} />
            <View style={styles.previewInfo}>
              <Text style={styles.previewName}>{name || 'Tên thuốc'}</Text>
              <Text style={styles.previewDose}>{dose || 'Liều lượng'} - {formType}</Text>
            </View>
          </View>
          <Text style={styles.previewTime}>{times.split(',')[0]?.trim() || '--:--'}</Text>
        </View>
      </SectionCard>

      <ActionButton
        label={mode === 'create' ? 'Lưu lịch uống thuốc' : 'Lưu thay đổi'}
        icon={<Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />}
        onPress={handleSubmit}
      />

      <ActionButton
        label="Hủy"
        tone="secondary"
        icon={<Ionicons name="close-circle-outline" size={18} color={MedsTheme.colors.textMain} />}
        onPress={onCancel}
      />

      {mode === 'edit' ? (
        <View style={styles.editActions}>
          <ActionButton
            label="Tạm dừng lịch thuốc"
            tone="warning"
            icon={<Ionicons name="pause-circle" size={18} color="#A65A00" />}
            onPress={onPause}
          />
          <ActionButton
            label="Xóa thuốc"
            tone="danger"
            icon={<Ionicons name="trash" size={18} color={MedsTheme.colors.danger} />}
            onPress={onDelete}
          />
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  stepRow: {
    flexDirection: 'row',
    gap: 10,
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E8F2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    fontWeight: '700',
    color: MedsTheme.colors.primaryDark,
  },
  stepLabel: {
    fontSize: 12,
    color: MedsTheme.colors.textMuted,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  toggleRow: {
    minHeight: 42,
    borderWidth: 1,
    borderColor: MedsTheme.colors.border,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
  },
  toggleHover: {
    opacity: 0.9,
  },
  toggleText: {
    fontWeight: '600',
    color: MedsTheme.colors.textMain,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  previewTitle: {
    color: MedsTheme.colors.textMain,
    fontSize: 16,
    fontWeight: '700',
  },
  previewCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MedsTheme.colors.border,
    backgroundColor: '#F8FBFF',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  previewLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  previewInfo: {
    flex: 1,
  },
  previewName: {
    color: MedsTheme.colors.textMain,
    fontWeight: '700',
    fontSize: 16,
  },
  previewDose: {
    color: MedsTheme.colors.textMuted,
    marginTop: 1,
  },
  previewTime: {
    color: MedsTheme.colors.primaryDark,
    fontWeight: '700',
    fontSize: 14,
  },
  editActions: {
    gap: 10,
  },
});
