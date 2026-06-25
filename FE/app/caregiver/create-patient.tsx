import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FeedbackToast } from '@/components/meds/feedback-toast';
import { ActionButton, AppScreen, ChoiceChip, PageHeader, SectionCard, TextField } from '@/components/meds/ui-kit';
import { MedsTheme } from '@/constants/meds-theme';
import { createPatientApi } from '@/services/auth-api';
import { useAuth } from '@/store/auth-store';

export default function CreatePatientScreen() {
  const { accessToken, setPortal } = useAuth();
  const [name, setName] = useState('');
  const [authPin, setAuthPin] = useState('');
  const [birthday, setBirthday] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | ''>('');
  const [triedSubmit, setTriedSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const nameError = triedSubmit && !name.trim() ? 'Vui lòng nhập họ tên bệnh nhân.' : undefined;
  const authPinError =
    triedSubmit && !/^\d{4}$/.test(authPin.trim()) ? 'Mã PIN phải gồm đúng 4 chữ số.' : undefined;

  const submit = async () => {
    if (isSubmitting) return;
    setTriedSubmit(true);
    if (nameError || authPinError) return;
    if (!accessToken) {
      setFeedbackMessage('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.');
      return;
    }

    try {
      setIsSubmitting(true);
      await createPatientApi({
        accessToken,
        payload: {
          name: name.trim(),
          authPin: authPin.trim(),
          birthday: birthday.trim() || undefined,
          gender: gender || undefined,
        },
      });
      await setPortal('caregiver');
      router.replace('/caregiver/dashboard');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể tạo bệnh nhân';
      setFeedbackMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppScreen>
      <PageHeader
        title="Tạo bệnh nhân"
        subtitle="Chưa có liên kết bệnh nhân. Hãy tạo hồ sơ để bệnh nhân có thể đăng nhập bằng SĐT người thân + PIN."
      />

      <SectionCard>
        <TextField
          label="Họ tên bệnh nhân"
          value={name}
          onChangeText={setName}
          placeholder="Nguyễn Văn B"
          error={nameError}
        />
        <TextField
          label="Mã PIN đăng nhập"
          value={authPin}
          onChangeText={setAuthPin}
          placeholder="4 chữ số"
          keyboardType="number-pad"
          error={authPinError}
        />
        <TextField
          label="Ngày sinh (không bắt buộc)"
          value={birthday}
          onChangeText={setBirthday}
          placeholder="YYYY-MM-DD"
        />

        <Text style={styles.genderLabel}>Giới tính (không bắt buộc)</Text>
        <View style={styles.genderRow}>
          <ChoiceChip label="Nam" active={gender === 'male'} onPress={() => setGender('male')} />
          <ChoiceChip label="Nữ" active={gender === 'female'} onPress={() => setGender('female')} />
          <ChoiceChip label="Khác" active={gender === 'other'} onPress={() => setGender('other')} />
        </View>
      </SectionCard>

      <ActionButton label={isSubmitting ? 'Đang tạo bệnh nhân...' : 'Tạo bệnh nhân'} onPress={submit} />
      <ActionButton label="Quay lại" tone="secondary" onPress={() => router.replace('/choose-role')} />

      <FeedbackToast message={feedbackMessage} tone="warning" onHide={() => setFeedbackMessage(null)} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  genderLabel: {
    color: MedsTheme.colors.textMain,
    fontSize: 15,
    fontWeight: '700',
  },
  genderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
