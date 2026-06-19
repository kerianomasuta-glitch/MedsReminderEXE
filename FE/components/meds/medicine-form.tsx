import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, Alert, TextInput } from 'react-native';

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
  const defaultTimesForCount = (count: number) => {
    if (count === 1) return ['07:00'];
    if (count === 2) return ['08:00', '20:00'];
    if (count === 3) return ['07:00', '13:00', '18:00'];
    return ['07:00', '12:00', '17:00', '21:00'];
  };

  const [timesCount, setTimesCount] = useState<number>(mode === 'edit' ? 3 : 3);
  const [times, setTimes] = useState<string[]>(
    mode === 'edit' ? (medication.time.split(',').map((t) => t.trim())) : defaultTimesForCount(timesCount),
  );
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');
  

  const openTimeInput = (idx: number) => {
    // Open inline editor for manual time input
    setEditingIndex(idx);
    setEditingValue(times[idx] ?? '07:00');
  };
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
    if (!times || times.length === 0 || times.some((tt) => !tt || !tt.trim())) next.times = 'Vui lòng thêm ít nhất 1 khung giờ uống.';
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
      {/* Stepper removed as requested */}

      <SectionCard>
        <FieldLabel text="1. Thông tin thuốc" />
        <TextField
          label="Tên thuốc"
          example="Ví dụ: Paracetamol 500mg"
          value={name}
          onChangeText={setName}
          error={errors.name}
        />

        <FieldLabel text="Loại thuốc" />
        <View style={styles.grid}>
          {medicineTypeOptions.map((item) => {
            const iconName =
              item === 'Dạng lỏng' ? 'water' : item === 'Viên nén' ? 'ellipse' : item === 'Viên nang' ? 'ellipse-outline' : item === 'Dạng sủi' ? 'sparkles' : item === 'Bột' ? 'leaf' : 'medkit';
            return (
              <ChoiceChip
                key={item}
                label={item}
                active={item === formType}
                onPress={() => setFormType(item)}
              />
            );
          })}
        </View>

        <TextField
          label="Liều lượng mỗi lần"
          example="Ví dụ: 1 viên / 10ml"
          value={dose}
          onChangeText={setDose}
          error={errors.dose}
        />
      </SectionCard>

      <SectionCard>
        <FieldLabel text="2. Lịch uống" />
        <FieldLabel text="Số lần uống trong ngày" />
        <View style={styles.grid}>
          {[1, 2, 3, 4].map((n) => (
            <ChoiceChip
              key={n}
              label={`${n} lần/ngày`}
              active={n === timesCount}
              onPress={() => {
                setTimesCount(n);
                setTimes(defaultTimesForCount(n));
              }}
            />
          ))}
        </View>

        <FieldLabel text="Chọn giờ (24h)" />
        <View style={styles.timesList}>
          {/** Hidden time inputs for web - removed; manual input used instead */}
          {times.map((t, idx) => (
            <View key={idx}>
              {editingIndex === idx ? (
                <TextInput
                  style={[styles.timeItem, styles.timeInput]}
                  value={editingValue}
                  onChangeText={setEditingValue}
                  autoFocus
                  onBlur={() => {
                    const val = editingValue.trim();
                    // basic HH:mm validation
                    const ok = /^\d{1,2}:\d{2}$/.test(val);
                    if (!ok) {
                      Alert.alert('Định dạng không hợp lệ', 'Vui lòng nhập giờ theo định dạng HH:mm');
                      return;
                    }
                    const next = [...times];
                    next[idx] = val.padStart(5, '0');
                    setTimes(next);
                    setEditingIndex(null);
                  }}
                  onSubmitEditing={() => {
                    // same as onBlur
                    const val = editingValue.trim();
                    const ok = /^\d{1,2}:\d{2}$/.test(val);
                    if (!ok) {
                      Alert.alert('Định dạng không hợp lệ', 'Vui lòng nhập giờ theo định dạng HH:mm');
                      return;
                    }
                    const next = [...times];
                    next[idx] = val.padStart(5, '0');
                    setTimes(next);
                    setEditingIndex(null);
                  }}
                  keyboardType="numbers-and-punctuation"
                />
              ) : (
                <Pressable
                  style={({ pressed }) => [
                    styles.timeItem,
                    pressed && styles.timeItemPressed
                  ]}
                  onPress={() => openTimeInput(idx)}
                  android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }}
                >
                  <Text style={styles.timeText}>{t}</Text>
                </Pressable>
              )}
            </View>
          ))}
        </View>

        {/* Native time picker removed - manual input only */}

        <TextField label="Ngày bắt đầu" value={"01/06/2026"} editable={false} />

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
          example="Ví dụ: Uống với nhiều nước. Không uống cùng sữa."
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
          <Text style={styles.previewTime}>{times[0] || '--:--'}</Text>
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
    gap: 12,
  },
  timesList: {
    flexDirection: 'column',
    gap: 10,
  },
  timeItem: {
    minHeight: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MedsTheme.colors.border,
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  timeInput: {
    paddingVertical: 12,
    fontSize: 20,
    fontWeight: '700',
    color: MedsTheme.colors.textMain,
  },
  timeItemPressed: {
    backgroundColor: '#F0F0F0',
    opacity: 0.8,
  },
  timeText: {
    fontSize: 20,
    fontWeight: '700',
    color: MedsTheme.colors.textMain,
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
    borderWidth: 1,
    borderColor: MedsTheme.colors.border,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
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
