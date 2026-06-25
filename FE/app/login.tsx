import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FeedbackToast } from '@/components/meds/feedback-toast';
import { ActionButton, AppScreen, BrandHeader, ChoiceChip, SectionCard, TextField } from '@/components/meds/ui-kit';
import { useAuth } from '@/store/auth-store';

export default function LoginScreen() {
  const { login } = useAuth();
  const [loginMode, setLoginMode] = useState<'caregiver' | 'patient'>('caregiver');
  const [account, setAccount] = useState('');
  const [caregiverPhone, setCaregiverPhone] = useState('');
  const [password, setPassword] = useState('');
  const [authPin, setAuthPin] = useState('');
  const [triedSubmit, setTriedSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const accountError =
    triedSubmit && loginMode === 'caregiver' && !account.trim() ? 'Vui lòng nhập email hoặc số điện thoại.' : undefined;
  const passwordError = triedSubmit && loginMode === 'caregiver' && !password.trim() ? 'Vui lòng nhập mật khẩu.' : undefined;
  const caregiverPhoneError =
    triedSubmit && loginMode === 'patient' && !caregiverPhone.trim() ? 'Vui lòng nhập SĐT người thân.' : undefined;
  const authPinError = triedSubmit && loginMode === 'patient' && !authPin.trim() ? 'Vui lòng nhập mã PIN 4 số.' : undefined;

  const submit = async () => {
    if (isSubmitting) return;
    setTriedSubmit(true);
    if (loginMode === 'caregiver' && (!account.trim() || !password.trim())) {
      return;
    }
    if (loginMode === 'patient' && (!caregiverPhone.trim() || !authPin.trim())) {
      return;
    }
    try {
      setIsSubmitting(true);
      const { role } =
        loginMode === 'caregiver'
          ? await login({
              mode: 'caregiver',
              username: account.trim(),
              password,
            })
          : await login({
              mode: 'patient',
              caregiverPhone: caregiverPhone.trim(),
              authPin: authPin.trim(),
            });
      setFeedbackMessage('Đăng nhập thành công');
      if (role === 'admin') {
        router.replace('/admin');
      } else if (role === 'caregiver') {
        router.replace('/caregiver/dashboard');
      } else {
        router.replace('/');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Đăng nhập thất bại';
      setFeedbackMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppScreen>
      <BrandHeader slogan="Nhắc lịch uống thuốc mỗi ngày" />

      <SectionCard>
        <View style={styles.modeRow}>
          <ChoiceChip label="Người thân chăm sóc" active={loginMode === 'caregiver'} onPress={() => setLoginMode('caregiver')} />
          <ChoiceChip label="Bệnh nhân" active={loginMode === 'patient'} onPress={() => setLoginMode('patient')} />
        </View>

        {loginMode === 'caregiver' ? (
          <>
            <TextField
              label="Email hoặc số điện thoại"
              value={account}
              onChangeText={setAccount}
              placeholder="example@mail.com hoặc 09xxxxxxxx"
              error={accountError}
            />

            <TextField
              label="Mật khẩu"
              value={password}
              onChangeText={setPassword}
              placeholder="Nhập mật khẩu"
              secureTextEntry
              error={passwordError}
            />
          </>
        ) : (
          <>
            <TextField
              label="Số điện thoại người thân"
              value={caregiverPhone}
              onChangeText={setCaregiverPhone}
              placeholder="09xxxxxxxx"
              error={caregiverPhoneError}
            />

            <TextField
              label="Mã PIN bệnh nhân"
              value={authPin}
              onChangeText={setAuthPin}
              placeholder="4 chữ số"
              keyboardType="number-pad"
              error={authPinError}
            />
          </>
        )}

        <ActionButton label={isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'} onPress={submit} />

        {loginMode === 'caregiver' ? (
          <Pressable onPress={() => router.push('/register')} style={styles.inlineLink}>
            <Text style={styles.inlineText}>Chưa có tài khoản?</Text>
            <Text style={styles.inlineStrong}>Đăng ký</Text>
          </Pressable>
        ) : null}
      </SectionCard>
      <FeedbackToast
        message={feedbackMessage}
        tone={feedbackMessage?.includes('thành công') ? 'success' : 'warning'}
        onHide={() => setFeedbackMessage(null)}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  modeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  inlineLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 2,
  },
  inlineText: {
    color: '#5D6D86',
  },
  inlineStrong: {
    color: '#1C70D1',
    fontWeight: '700',
  },
});
