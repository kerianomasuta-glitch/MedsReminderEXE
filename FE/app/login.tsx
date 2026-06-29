import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppAlert } from '@/components/meds/app-alert';
import { FeedbackToast } from '@/components/meds/feedback-toast';
import { ActionButton, AppScreen, BrandHeader, ChoiceChip, SectionCard, TextField } from '@/components/meds/ui-kit';
import { MedsTheme } from '@/constants/meds-theme';
import { useAuth } from '@/store/auth-store';

export default function LoginScreen() {
  const { login } = useAuth();
  const [loginMode, setLoginMode] = useState<'caregiver' | 'patient'>('caregiver');
  const [account, setAccount] = useState('');
  const [caregiverPhone, setCaregiverPhone] = useState('');
  const [password, setPassword] = useState('');
  const [authPin, setAuthPin] = useState('');
  const [submittedMode, setSubmittedMode] = useState<'caregiver' | 'patient' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [loginAlert, setLoginAlert] = useState<{ title: string; message: string } | null>(null);

  const showCaregiverErrors = submittedMode === 'caregiver' && loginMode === 'caregiver';
  const showPatientErrors = submittedMode === 'patient' && loginMode === 'patient';

  const accountError =
    showCaregiverErrors && !account.trim() ? 'Vui lòng nhập email hoặc số điện thoại.' : undefined;
  const passwordError = showCaregiverErrors && !password.trim() ? 'Vui lòng nhập mật khẩu.' : undefined;
  const caregiverPhoneError =
    showPatientErrors && !caregiverPhone.trim() ? 'Vui lòng nhập SĐT người thân.' : undefined;
  const authPinError = showPatientErrors && !authPin.trim() ? 'Vui lòng nhập mã PIN 4 số.' : undefined;

  const switchLoginMode = (mode: 'caregiver' | 'patient') => {
    setLoginMode(mode);
    setSubmittedMode(null);
  };

  const submit = async () => {
    if (isSubmitting) return;
    setSubmittedMode(loginMode);
    if (loginMode === 'caregiver' && (!account.trim() || !password.trim())) {
      return;
    }
    if (loginMode === 'patient' && (!caregiverPhone.trim() || !authPin.trim())) {
      return;
    }
    try {
      setIsSubmitting(true);
      const result =
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

      if ('error' in result) {
        setLoginAlert({ title: 'Thông báo', message: result.error });
        return;
      }

      setFeedbackMessage('Đăng nhập thành công');
      const { role } = result;
      if (role === 'admin') {
        router.replace('/admin');
      } else if (role === 'caregiver') {
        router.replace('/caregiver/dashboard');
      } else {
        router.replace('/');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <AppScreen hero paddedBottom={120}>
      <BrandHeader slogan="Nhắc lịch uống thuốc mỗi ngày" />

      <SectionCard>
        <View style={styles.modeRow}>
          <ChoiceChip label="Người thân chăm sóc" active={loginMode === 'caregiver'} onPress={() => switchLoginMode('caregiver')} />
          <ChoiceChip label="Bệnh nhân" active={loginMode === 'patient'} onPress={() => switchLoginMode('patient')} />
        </View>

        {loginMode === 'caregiver' ? (
          <>
            <TextField
              label="Email hoặc số điện thoại"
              value={account}
              onChangeText={setAccount}
              
              error={accountError}
            />

            <TextField
              label="Mật khẩu"
              value={password}
              onChangeText={setPassword}
             
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
      </AppScreen>

      <AppAlert
        visible={loginAlert !== null}
        title={loginAlert?.title ?? ''}
        message={loginAlert?.message ?? ''}
        onClose={() => setLoginAlert(null)}
      />
      <FeedbackToast
        message={feedbackMessage}
        tone={feedbackMessage?.includes('thành công') ? 'success' : 'warning'}
        onHide={() => setFeedbackMessage(null)}
      />
    </>
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
    color: MedsTheme.colors.body,
    fontFamily: MedsTheme.fonts.sans,
    fontSize: 14,
  },
  inlineStrong: {
    color: MedsTheme.colors.textLink,
    fontFamily: MedsTheme.fonts.sansMedium,
    fontWeight: '500',
  },
});
