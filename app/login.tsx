import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ActionButton, AppScreen, BrandHeader, ChoiceChip, SectionCard, TextField } from '@/components/meds/ui-kit';

export default function LoginScreen() {
  const [role, setRole] = useState<'primary' | 'caregiver'>('primary');
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [triedSubmit, setTriedSubmit] = useState(false);

  const accountError = triedSubmit && !account.trim() ? 'Vui lòng nhập email hoặc số điện thoại.' : undefined;
  const passwordError = triedSubmit && !password.trim() ? 'Vui lòng nhập mật khẩu.' : undefined;

  const submit = () => {
    setTriedSubmit(true);
    if (!account.trim() || !password.trim()) {
      return;
    }
    router.replace('/');
  };

  return (
    <AppScreen>
      <BrandHeader slogan="Nhắc lịch uống thuốc mỗi ngày" />

      <SectionCard>
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

        <Text style={styles.roleTitle}>Vai trò đăng nhập</Text>
        <View style={styles.roleRow}>
          <ChoiceChip label="Người dùng chính" active={role === 'primary'} onPress={() => setRole('primary')} />
          <ChoiceChip label="Người thân chăm sóc" active={role === 'caregiver'} onPress={() => setRole('caregiver')} />
        </View>

        <ActionButton label="Đăng nhập" onPress={submit} />

        <Pressable onPress={() => router.push('/forgot-password')} style={styles.linkWrap}>
          <Text style={styles.linkText}>Quên mật khẩu</Text>
        </Pressable>

        <Pressable onPress={() => router.push('/register')} style={styles.inlineLink}>
          <Text style={styles.inlineText}>Chưa có tài khoản?</Text>
          <Text style={styles.inlineStrong}>Đăng ký</Text>
        </Pressable>
      </SectionCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  roleTitle: {
    marginTop: 2,
    fontSize: 15,
    fontWeight: '700',
  },
  roleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  linkWrap: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  linkText: {
    color: '#1C70D1',
    fontWeight: '700',
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
