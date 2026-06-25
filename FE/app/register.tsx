import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FeedbackToast } from '@/components/meds/feedback-toast';
import { ActionButton, AppScreen, PageHeader, SectionCard, TextField } from '@/components/meds/ui-kit';
import { useAuth } from '@/store/auth-store';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const nameError = submitted && !fullName.trim() ? 'Vui lòng nhập họ tên.' : undefined;
  const emailError = submitted && !email.trim() ? 'Vui lòng nhập email.' : undefined;
  const phoneError = submitted && !phone.trim() ? 'Vui lòng nhập số điện thoại.' : undefined;
  const passwordError = submitted && password.length < 6 ? 'Mật khẩu tối thiểu 6 ký tự.' : undefined;
  const confirmError =
    submitted && confirmPassword !== password ? 'Mật khẩu xác nhận không khớp.' : undefined;
  const termsError = submitted && !accepted ? 'Bạn cần đồng ý điều khoản.' : undefined;

  const submit = async () => {
    if (isSubmitting) return;
    setSubmitted(true);
    if (nameError || emailError || phoneError || passwordError || confirmError || termsError) {
      return;
    }
    try {
      setIsSubmitting(true);
      await register({
        name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
      });
      setFeedbackMessage('Đăng ký thành công, vui lòng đăng nhập.');
      router.replace('/login');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Đăng ký thất bại';
      setFeedbackMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppScreen>
      <PageHeader title="Đăng ký tài khoản" subtitle="Tạo hồ sơ để theo dõi lịch uống thuốc dễ dàng hơn." />

      <SectionCard>
        <TextField
          label="Họ tên"
          value={fullName}
          onChangeText={setFullName}
          placeholder="Nguyễn Văn A"
          error={nameError}
        />
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="example@mail.com"
          error={emailError}
        />
        <TextField
          label="Số điện thoại"
          value={phone}
          onChangeText={setPhone}
          placeholder="09xxxxxxxx"
          error={phoneError}
        />
        <TextField
          label="Mật khẩu"
          value={password}
          onChangeText={setPassword}
          placeholder="Ít nhất 6 ký tự"
          secureTextEntry
          error={passwordError}
        />
        <TextField
          label="Xác nhận mật khẩu"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          placeholder="Nhập lại mật khẩu"
          error={confirmError}
        />

        <Pressable
          onPress={() => setAccepted((prev) => !prev)}
          style={({ pressed, hovered }) => [styles.checkboxRow, (pressed || hovered) && styles.activeRow]}>
          <Text style={styles.checkboxMark}>{accepted ? '☑' : '☐'}</Text>
          <Text style={styles.checkboxText}>Đồng ý điều khoản và bảo mật sức khỏe</Text>
        </Pressable>
        {termsError ? <Text style={styles.errorText}>{termsError}</Text> : null}

        <ActionButton label={isSubmitting ? 'Đang tạo...' : 'Tạo tài khoản'} onPress={submit} />

        <Pressable style={styles.backLink} onPress={() => router.push('/login')}>
          <Text style={styles.backText}>Đã có tài khoản? Đăng nhập</Text>
        </Pressable>
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
  checkboxRow: {
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D9E2F0',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  checkboxMark: {
    fontSize: 18,
  },
  checkboxText: {
    flex: 1,
    color: '#354760',
    fontSize: 14,
  },
  errorText: {
    fontSize: 12,
    color: '#D23B3B',
    fontWeight: '600',
    marginTop: -2,
  },
  backLink: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  backText: {
    color: '#1C70D1',
    fontWeight: '700',
  },
  activeRow: {
    opacity: 0.9,
  },
});
