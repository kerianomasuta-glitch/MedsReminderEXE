import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { addMedicationNoteOptions, addMedicationTypeOptions } from '@/constants/app-mock';
import { MedsTheme } from '@/constants/meds-theme';

export default function AddMedicationScreen() {
  const [selectedType, setSelectedType] = useState<(typeof addMedicationTypeOptions)[number]['id']>('capsule');
  const [selectedNote, setSelectedNote] = useState<(typeof addMedicationNoteOptions)[number]['id']>('after');

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Tên thuốc</Text>
          <View style={styles.inputWrap}>
            <TextInput
              placeholder="Ví dụ: Paracetamol 500mg"
              placeholderTextColor="#98A4B6"
              style={styles.textInput}
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Loại thuốc</Text>
          <View style={styles.typeGrid}>
            {addMedicationTypeOptions.map((type) => {
              const isActive = type.id === selectedType;
              return (
                <Pressable
                  key={type.id}
                  style={[styles.typeCard, isActive && styles.typeCardActive]}
                  onPress={() => setSelectedType(type.id)}>
                  <Ionicons
                    name={type.icon}
                    size={20}
                    color={isActive ? MedsTheme.colors.primaryDark : MedsTheme.colors.textMuted}
                  />
                  <Text style={[styles.typeLabel, isActive && styles.typeLabelActive]}>{type.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.fieldGroup, styles.rowField]}>
            <Text style={styles.label}>Liều lượng mỗi lần</Text>
            <View style={styles.inlineInput}>
              <Text style={styles.inlineMain}>1</Text>
              <Text style={styles.inlineSub}>viên/liều</Text>
            </View>
          </View>
          <View style={[styles.fieldGroup, styles.rowField]}>
            <Text style={styles.label}>Giờ uống</Text>
            <View style={styles.inlineInput}>
              <Ionicons name="time-outline" size={16} color={MedsTheme.colors.textMuted} />
              <Text style={styles.inlineMain}>08:00 AM</Text>
              <Ionicons name="alarm-outline" size={16} color={MedsTheme.colors.textMuted} />
            </View>
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Tần suất</Text>
          <Pressable style={styles.selectField}>
            <Text style={styles.selectText}>Mỗi ngày</Text>
            <Ionicons name="chevron-down" size={16} color={MedsTheme.colors.textMuted} />
          </Pressable>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Lưu ý khi uống</Text>
          <View style={styles.chipRow}>
            {addMedicationNoteOptions.map((note) => {
              const active = note.id === selectedNote;
              return (
                <Pressable
                  key={note.id}
                  style={[styles.noteChip, active && styles.noteChipActive]}
                  onPress={() => setSelectedNote(note.id)}>
                  <Text style={[styles.noteChipText, active && styles.noteChipTextActive]}>{note.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Ghi chú thêm (tùy chọn)</Text>
          <View style={styles.noteInputWrap}>
            <TextInput
              multiline
              numberOfLines={4}
              placeholder="Nhập lưu ý hoặc hướng dẫn từ bác sĩ..."
              placeholderTextColor="#98A4B6"
              style={styles.noteInput}
              textAlignVertical="top"
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={styles.saveButton}
          onPress={() => router.push({ pathname: '/medication/[id]', params: { id: 'new-medication' } })}>
          <Text style={styles.saveButtonText}>Lưu và điền chi tiết thuốc</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: MedsTheme.colors.appBackground,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 16,
    paddingBottom: 30,
  },
  fieldGroup: {
    gap: 7,
  },
  label: {
    color: MedsTheme.colors.textMain,
    fontSize: 15,
    fontWeight: '600',
  },
  inputWrap: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MedsTheme.colors.border,
    backgroundColor: MedsTheme.colors.card,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  textInput: {
    fontSize: 16,
    color: MedsTheme.colors.textMain,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeCard: {
    width: '48.6%',
    minHeight: 84,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MedsTheme.colors.border,
    backgroundColor: MedsTheme.colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  typeCardActive: {
    borderColor: '#9AC8FF',
    backgroundColor: '#EAF3FF',
  },
  typeLabel: {
    color: MedsTheme.colors.textMain,
    fontWeight: '600',
  },
  typeLabelActive: {
    color: MedsTheme.colors.primaryDark,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  rowField: {
    flex: 1,
  },
  inlineInput: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MedsTheme.colors.border,
    backgroundColor: MedsTheme.colors.card,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  inlineMain: {
    color: MedsTheme.colors.primaryDark,
    fontWeight: '700',
    fontSize: 17,
  },
  inlineSub: {
    color: MedsTheme.colors.textMuted,
    fontSize: 14,
  },
  selectField: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MedsTheme.colors.border,
    backgroundColor: MedsTheme.colors.card,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    color: MedsTheme.colors.textMain,
    fontSize: 16,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  noteChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: MedsTheme.colors.border,
  },
  noteChipActive: {
    backgroundColor: '#2B8EFF',
    borderColor: '#2B8EFF',
  },
  noteChipText: {
    color: MedsTheme.colors.textMain,
    fontWeight: '600',
    fontSize: 13,
  },
  noteChipTextActive: {
    color: '#FFFFFF',
  },
  noteInputWrap: {
    minHeight: 102,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MedsTheme.colors.border,
    backgroundColor: MedsTheme.colors.card,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  noteInput: {
    fontSize: 15,
    color: MedsTheme.colors.textMain,
    minHeight: 80,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#DCE5F3',
    backgroundColor: MedsTheme.colors.pageBackground,
  },
  saveButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: MedsTheme.colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
