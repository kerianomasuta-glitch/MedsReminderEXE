import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { ActionButton, AppScreen, ChoiceChip, PageHeader, SectionCard } from '@/components/meds/ui-kit';
import { aiQuickSymptoms, aiResultMock } from '@/constants/app-mock';
import { MedsTheme } from '@/constants/meds-theme';

export default function AiAssistantScreen() {
  const [symptoms, setSymptoms] = useState('');
  const [showResult, setShowResult] = useState(false);

  const isDanger = useMemo(() => {
    const text = symptoms.toLowerCase();
    return text.includes('khó thở') || text.includes('đau ngực') || text.includes('ngất');
  }, [symptoms]);

  return (
    <AppScreen>
      <PageHeader title="Hỏi AI" subtitle="Hỗ trợ tham khảo triệu chứng nhanh trước khi đi khám." />

      <SectionCard style={styles.warningCard}>
        <Text style={styles.warningText}>
          Thông tin từ AI chỉ mang tính tham khảo, không thay thế chẩn đoán hoặc điều trị từ bác sĩ.
        </Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.label}>Mô tả triệu chứng của bạn</Text>
        <TextInput
          value={symptoms}
          onChangeText={setSymptoms}
          multiline
          numberOfLines={5}
          placeholder="Ví dụ: Đau đầu nhẹ, ho khan 2 ngày, hơi mệt..."
          placeholderTextColor="#91A1B6"
          style={styles.textarea}
        />

        <Text style={styles.label}>Triệu chứng nhanh</Text>
        <View style={styles.chips}>
          {aiQuickSymptoms.map((item) => (
            <ChoiceChip
              key={item}
              label={item}
              active={symptoms.includes(item)}
              onPress={() => setSymptoms((prev) => (prev ? `${prev}, ${item}` : item))}
            />
          ))}
        </View>

        <ActionButton
          label="Phân tích triệu chứng"
          icon={<Ionicons name="sparkles" size={18} color="#FFFFFF" />}
          onPress={() => setShowResult(true)}
        />
      </SectionCard>

      {showResult ? (
        <SectionCard>
          <Text style={styles.resultTitle}>Kết quả AI (tham khảo)</Text>
          <ResultRow label="Tóm tắt triệu chứng" value={aiResultMock.summary} />
          <ResultRow label="Khả năng nguyên nhân tham khảo" value={aiResultMock.possibleCause} />
          <ResultRow label="Gợi ý chăm sóc ban đầu" value={aiResultMock.initialCare} />
          <ResultRow label="Khi nào nên đi khám" value={aiResultMock.medicalVisitWhen} />
          <ResultRow label="Cảnh báo nguy hiểm" value={aiResultMock.dangerWarning} />
        </SectionCard>
      ) : null}

      {isDanger ? (
        <SectionCard style={styles.dangerAlert}>
          <Text style={styles.dangerText}>Bạn nên đến cơ sở y tế gần nhất.</Text>
        </SectionCard>
      ) : null}
    </AppScreen>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.resultRow}>
      <Text style={styles.resultLabel}>{label}</Text>
      <Text style={styles.resultValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  warningCard: {
    backgroundColor: '#FFF3DD',
    borderColor: '#F7D5A4',
  },
  warningText: {
    color: '#8A5A00',
    lineHeight: 20,
    fontWeight: '600',
  },
  label: {
    color: MedsTheme.colors.textMain,
    fontSize: 15,
    fontWeight: '700',
  },
  textarea: {
    minHeight: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MedsTheme.colors.border,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: MedsTheme.colors.textMain,
    textAlignVertical: 'top',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  resultTitle: {
    color: MedsTheme.colors.textMain,
    fontSize: 19,
    fontWeight: '800',
  },
  resultRow: {
    gap: 2,
  },
  resultLabel: {
    color: '#4B5E77',
    fontSize: 13,
    fontWeight: '700',
  },
  resultValue: {
    color: MedsTheme.colors.textMain,
    lineHeight: 20,
  },
  dangerAlert: {
    backgroundColor: '#FCEBEC',
    borderColor: '#F5C7CB',
  },
  dangerText: {
    color: '#AF2E3E',
    fontSize: 17,
    fontWeight: '800',
  },
});
