import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ActionButton, AppScreen, ChoiceChip, PageHeader, SectionCard, TextField } from '@/components/meds/ui-kit';

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'primary' | 'caregiver'>('primary');
  const [accepted, setAccepted] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const nameError = submitted && !fullName.trim() ? 'Vui lòng nhập họ tên.' : undefined;
  const accountError = submitted && !account.trim() ? 'Vui lòng nhập email hoặc số điện thoại.' : undefined;
  const passwordError = submitted && password.length < 6 ? 'Mật khẩu tối thiểu 6 ký tự.' : undefined;
  const confirmError =
    submitted && confirmPassword !== password ? 'Mật khẩu xác nhận không khớp.' : undefined;
  const termsError = submitted && !accepted ? 'Bạn cần đồng ý điều khoản.' : undefined;

  const submit = () => {
    setSubmitted(true);
    if (nameError || accountError || passwordError || confirmError || termsError) {
      return;
    }
    router.replace('/login');
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

        <Text style={styles.sectionTitle}>Vai trò</Text>
        <View style={styles.roleRow}>
          <ChoiceChip label="Người dùng chính" active={role === 'primary'} onPress={() => setRole('primary')} />
          <ChoiceChip label="Người thân" active={role === 'caregiver'} onPress={() => setRole('caregiver')} />
        </View>

        <Pressable
          onPress={() => setAccepted((prev) => !prev)}
          style={({ pressed, hovered }) => [styles.checkboxRow, (pressed || hovered) && styles.activeRow]}>
          <Text style={styles.checkboxMark}>{accepted ? '☑' : '☐'}</Text>
          <Text style={styles.checkboxText}>Đồng ý điều khoản và bảo mật sức khỏe</Text>
        </Pressable>
        {termsError ? <Text style={styles.errorText}>{termsError}</Text> : null}

        <ActionButton label="Tạo tài khoản" onPress={submit} />

        <Pressable style={styles.backLink} onPress={() => router.push('/login')}>
          <Text style={styles.backText}>Đã có tài khoản? Đăng nhập</Text>
        </Pressable>
      </SectionCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F223D',
  },
  roleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
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
