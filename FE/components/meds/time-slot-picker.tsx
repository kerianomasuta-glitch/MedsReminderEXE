import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ChoiceChip } from '@/components/meds/ui-kit';
import { MedsTheme } from '@/constants/meds-theme';
import type { ScheduleTimeSlot } from '@/services/schedule-api';

function generateTimeOptions() {
  const options: string[] = [];
  for (let hour = 0; hour < 24; hour += 1) {
    for (const minute of [0, 30]) {
      options.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
    }
  }
  return options;
}

const TIME_OPTIONS = generateTimeOptions();

type TimeSlotPickerProps = {
  value: ScheduleTimeSlot[];
  onChange: (slots: ScheduleTimeSlot[]) => void;
  /** Ghi chú lấy từ đơn thuốc — chỉ chọn giờ, không chỉnh ghi chú */
  notesFromPrescription?: boolean;
  defaultDosageNote?: string;
};

export function TimeSlotPicker({
  value,
  onChange,
  notesFromPrescription = false,
  defaultDosageNote = 'Theo đơn thuốc',
}: TimeSlotPickerProps) {
  const [visible, setVisible] = useState(false);
  const [draftSlots, setDraftSlots] = useState<ScheduleTimeSlot[]>(value);

  const selectedTimes = useMemo(() => new Set(draftSlots.map((slot) => slot.time)), [draftSlots]);

  const openPicker = () => {
    setDraftSlots(value.length ? value : [{ time: '08:00', dosageNote: defaultDosageNote }]);
    setVisible(true);
  };

  const closePicker = () => {
    setVisible(false);
  };

  const confirmPicker = () => {
    const cleaned = draftSlots
      .filter((slot) => slot.time)
      .sort((a, b) => a.time.localeCompare(b.time));
    onChange(cleaned);
    closePicker();
  };

  const resolveNoteForTime = (time: string) => {
    return (
      value.find((slot) => slot.time === time)?.dosageNote ??
      draftSlots.find((slot) => slot.time === time)?.dosageNote ??
      defaultDosageNote
    );
  };

  const toggleTime = (time: string) => {
    setDraftSlots((prev) => {
      const exists = prev.find((slot) => slot.time === time);
      if (exists) {
        return prev.filter((slot) => slot.time !== time);
      }
      const dosageNote = notesFromPrescription ? resolveNoteForTime(time) : 'Uống sau ăn';
      return [...prev, { time, dosageNote }].sort((a, b) => a.time.localeCompare(b.time));
    });
  };

  const updateNote = (time: string, dosageNote: string) => {
    if (notesFromPrescription) return;
    setDraftSlots((prev) => prev.map((slot) => (slot.time === time ? { ...slot, dosageNote } : slot)));
  };

  const removeSlot = (time: string) => {
    onChange(value.filter((slot) => slot.time !== time));
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Khung giờ uống *</Text>
      <Text style={styles.hint}>Chọn giờ uống thuốc trong ngày. Có thể chọn nhiều khung giờ.</Text>

      {value.length ? (
        <View style={styles.selectedList}>
          {value.map((slot) => (
            <View key={slot.time} style={styles.selectedItem}>
              <View style={styles.selectedMain}>
                <Text style={styles.selectedTime}>{slot.time}</Text>
                {!notesFromPrescription ? (
                  <Text style={styles.selectedNote}>{slot.dosageNote || 'Không có ghi chú'}</Text>
                ) : null}
              </View>
              <Pressable onPress={() => removeSlot(slot.time)} hitSlop={8} style={styles.removeBtn}>
                <Ionicons name="close-circle" size={20} color={MedsTheme.colors.muted} />
              </Pressable>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.emptyText}>Chưa chọn khung giờ nào.</Text>
      )}

      <Pressable style={({ pressed }) => [styles.trigger, pressed && styles.triggerPressed]} onPress={openPicker}>
        <Ionicons name="time-outline" size={18} color={MedsTheme.colors.ink} />
        <Text style={styles.triggerText}>{value.length ? 'Chỉnh sửa khung giờ' : 'Chọn khung giờ uống'}</Text>
        <Ionicons name="chevron-down" size={18} color={MedsTheme.colors.muted} />
      </Pressable>

      <Modal visible={visible} transparent animationType="slide" onRequestClose={closePicker}>
        <View style={styles.overlay}>
          <Pressable style={styles.backdrop} onPress={closePicker} />
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Chọn khung giờ uống</Text>
              <Pressable onPress={closePicker} hitSlop={10}>
                <Ionicons name="close" size={22} color={MedsTheme.colors.ink} />
              </Pressable>
            </View>

            <ScrollView
              style={styles.sheetBody}
              contentContainerStyle={styles.sheetBodyContent}
              showsVerticalScrollIndicator
              nestedScrollEnabled>
              {draftSlots.length ? (
                <View style={styles.draftSection}>
                  <Text style={styles.draftTitle}>Đã chọn ({draftSlots.length})</Text>
                  {draftSlots.map((slot) => (
                    <View key={slot.time} style={styles.draftItem}>
                      <Text style={styles.draftTime}>{slot.time}</Text>
                      {!notesFromPrescription ? (
                        <>
                          <Text style={styles.noteScrollLabel}>Cuộn và chọn ghi chú</Text>
                          <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.noteChipRow}>
                            {['Uống sau ăn', 'Uống trước ăn', 'Trước khi ngủ', 'Theo chỉ định'].map((preset) => (
                              <ChoiceChip
                                key={preset}
                                label={preset}
                                active={slot.dosageNote === preset}
                                onPress={() => updateNote(slot.time, preset)}
                              />
                            ))}
                          </ScrollView>
                          {slot.dosageNote ? (
                            <Text style={styles.selectedNoteText}>{slot.dosageNote}</Text>
                          ) : null}
                        </>
                      ) : null}
                    </View>
                  ))}
                </View>
              ) : null}

              <Text style={styles.listTitle}>Cuộn và chọn giờ</Text>
              <View style={styles.timeList}>
                {TIME_OPTIONS.map((time) => {
                  const active = selectedTimes.has(time);
                  return (
                    <Pressable
                      key={time}
                      style={[styles.timeOption, active && styles.timeOptionActive]}
                      onPress={() => toggleTime(time)}>
                      <Text style={[styles.timeOptionText, active && styles.timeOptionTextActive]}>{time}</Text>
                      {active ? (
                        <Ionicons name="checkmark-circle" size={18} color={MedsTheme.colors.semanticSuccess} />
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            <View style={styles.sheetFooter}>
              <Pressable
                style={[styles.confirmBtn, !draftSlots.length && styles.confirmBtnDisabled]}
                disabled={!draftSlots.length}
                onPress={confirmPicker}>
                <Text style={styles.confirmBtnText}>Xong</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontFamily: MedsTheme.fonts.sansSemiBold,
    color: MedsTheme.colors.ink,
  },
  hint: {
    fontSize: 13,
    fontFamily: MedsTheme.fonts.sans,
    color: MedsTheme.colors.body,
    lineHeight: 18,
  },
  selectedList: {
    gap: 8,
  },
  selectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: MedsTheme.colors.hairlineStrong,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F8FBFF',
  },
  selectedMain: {
    flex: 1,
    gap: 2,
  },
  selectedTime: {
    fontSize: 16,
    fontFamily: MedsTheme.fonts.sansSemiBold,
    color: MedsTheme.colors.ink,
  },
  selectedNote: {
    fontSize: 13,
    fontFamily: MedsTheme.fonts.sans,
    color: MedsTheme.colors.body,
  },
  removeBtn: {
    padding: 2,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: MedsTheme.fonts.sans,
    color: MedsTheme.colors.muted,
    fontStyle: 'italic',
  },
  trigger: {
    minHeight: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: MedsTheme.colors.hairlineStrong,
    backgroundColor: MedsTheme.colors.surfaceCard,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  triggerPressed: {
    opacity: 0.9,
  },
  triggerText: {
    flex: 1,
    fontSize: 15,
    fontFamily: MedsTheme.fonts.sansMedium,
    color: MedsTheme.colors.ink,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    maxHeight: '85%',
    flexDirection: 'column',
    backgroundColor: MedsTheme.colors.canvas,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: MedsTheme.colors.hairlineSoft,
  },
  sheetTitle: {
    fontSize: 18,
    fontFamily: MedsTheme.fonts.sansSemiBold,
    color: MedsTheme.colors.ink,
  },
  sheetBody: {
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0,
  },
  sheetBodyContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 12,
  },
  sheetFooter: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: MedsTheme.colors.hairlineSoft,
    backgroundColor: MedsTheme.colors.canvas,
  },
  draftSection: {
    gap: 10,
  },
  draftTitle: {
    fontSize: 13,
    fontFamily: MedsTheme.fonts.sansSemiBold,
    color: MedsTheme.colors.body,
  },
  draftItem: {
    gap: 8,
    paddingVertical: 4,
  },
  draftTime: {
    fontSize: 15,
    fontFamily: MedsTheme.fonts.sansSemiBold,
    color: MedsTheme.colors.ink,
  },
  noteScrollLabel: {
    fontSize: 12,
    fontFamily: MedsTheme.fonts.sans,
    color: MedsTheme.colors.muted,
  },
  noteChipRow: {
    gap: 8,
    paddingVertical: 2,
  },
  selectedNoteText: {
    fontSize: 13,
    fontFamily: MedsTheme.fonts.sansMedium,
    color: MedsTheme.colors.body,
  },
  listTitle: {
    fontSize: 13,
    fontFamily: MedsTheme.fonts.sansSemiBold,
    color: MedsTheme.colors.body,
  },
  timeList: {
    borderWidth: 1,
    borderColor: MedsTheme.colors.hairline,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  timeOption: {
    minHeight: 44,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: MedsTheme.colors.hairlineSoft,
  },
  timeOptionActive: {
    backgroundColor: '#ECFDF3',
  },
  timeOptionText: {
    fontSize: 15,
    fontFamily: MedsTheme.fonts.sans,
    color: MedsTheme.colors.ink,
  },
  timeOptionTextActive: {
    fontFamily: MedsTheme.fonts.sansSemiBold,
    color: MedsTheme.colors.semanticSuccess,
  },
  confirmBtn: {
    minHeight: 46,
    borderRadius: 10,
    backgroundColor: MedsTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnDisabled: {
    opacity: 0.5,
  },
  confirmBtnText: {
    fontSize: 15,
    fontFamily: MedsTheme.fonts.sansSemiBold,
    color: MedsTheme.colors.onPrimary,
  },
});
