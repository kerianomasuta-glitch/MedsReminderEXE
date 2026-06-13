import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ActionButton, AppScreen, PageHeader, SectionCard, TextField } from '@/components/meds/ui-kit';
import { MedsTheme } from '@/constants/meds-theme';

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [account, setAccount] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const accountError = submitted && !account.trim() ? 'Vui lòng nhập email hoặc số điện thoại.' : undefined;
  const otpError = submitted && step === 'verify' && otp.trim().length < 4 ? 'Vui lòng nhập OTP hợp lệ.' : undefined;
  const passError =
    submitted && step === 'verify' && password.trim().length < 6 ? 'Mật khẩu mới tối thiểu 6 ký tự.' : undefined;
  const confirmError =
    submitted && step === 'verify' && confirmPassword !== password ? 'Mật khẩu xác nhận không khớp.' : undefined;

  const sendCode = () => {
    setSubmitted(true);
    if (!account.trim()) return;
    setStep('verify');
    setSubmitted(false);
  };

  const resetPassword = () => {
    setSubmitted(true);
    if (!otpError && !passError && !confirmError) {
      router.replace('/login');
    }
  };

  return (
    <AppScreen>
      <PageHeader title="Quên mật khẩu" subtitle="Khôi phục tài khoản bằng OTP để tiếp tục theo dõi lịch uống." />

      <SectionCard>
        <TextField
          label="Email hoặc số điện thoại"
          value={account}
          onChangeText={setAccount}
          placeholder="example@mail.com hoặc 09xxxxxxxx"
          error={accountError}
        />

        {step === 'request' ? (
          <ActionButton
            label="Gửi mã xác nhận"
            icon={<Ionicons name="send" size={18} color="#FFFFFF" />}
            onPress={sendCode}
          />
        ) : (
          <>
            <View style={styles.otpBox}>
              <Text style={styles.otpTitle}>Nhập mã OTP</Text>
              <Text style={styles.otpSub}>Mã gồm 6 chữ số đã được gửi tới tài khoản của bạn.</Text>
            </View>

            <TextField
              label="OTP"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              placeholder="123456"
              error={otpError}
            />
            <TextField
              label="Mật khẩu mới"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Nhập mật khẩu mới"
              error={passError}
            />
            <TextField
              label="Xác nhận mật khẩu mới"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              placeholder="Nhập lại mật khẩu mới"
              error={confirmError}
            />
            <ActionButton
              label="Đặt lại mật khẩu"
              icon={<Ionicons name="shield-checkmark" size={18} color="#FFFFFF" />}
              onPress={resetPassword}
            />
          </>
        )}
      </SectionCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  otpBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MedsTheme.colors.border,
    backgroundColor: '#F7FBFF',
    padding: 12,
    gap: 3,
  },
  otpTitle: {
    color: MedsTheme.colors.textMain,
    fontSize: 16,
    fontWeight: '700',
  },
  otpSub: {
    color: MedsTheme.colors.textMuted,
    fontSize: 13,
  },
});
