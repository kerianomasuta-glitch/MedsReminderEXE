import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FeedbackToast } from '@/components/meds/feedback-toast';
import { ActionButton, AppScreen, PageHeader, SectionCard } from '@/components/meds/ui-kit';
import { MedsTheme } from '@/constants/meds-theme';
import { getMyPatientsApi } from '@/services/auth-api';
import { useAuth } from '@/store/auth-store';

export default function ChooseRoleScreen() {
  const { role, setPortal, accessToken } = useAuth();
  const [isCheckingPatients, setIsCheckingPatients] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const choosePortal = async (portal: 'patient' | 'caregiver') => {
    await setPortal(portal);
    if (portal === 'patient') {
      router.replace('/');
      return;
    }
    if (!accessToken) {
      setFeedbackMessage('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.');
      return;
    }

    try {
      setIsCheckingPatients(true);
      const response = await getMyPatientsApi({ accessToken });
      if (!response.data.length) {
        router.replace('/caregiver/create-patient');
        return;
      }
      router.replace('/caregiver/dashboard');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không kiểm tra được liên kết bệnh nhân';
      setFeedbackMessage(message);
    } finally {
      setIsCheckingPatients(false);
    }
  };

  if (role === 'admin') {
    return (
      <AppScreen>
        <PageHeader title="Tài khoản admin" subtitle="Bạn sẽ được chuyển tới trang quản trị." />
        <FeedbackToast message="Đăng nhập thành công" tone="success" />
        <ActionButton label="Vào trang Admin" onPress={() => router.replace('/admin')} />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <PageHeader title="Bạn là ai?" subtitle="Chọn chế độ sử dụng để vào đúng giao diện." />

      <SectionCard style={styles.card}>
        <View style={styles.iconWrap}>
          <Ionicons name="person" size={20} color={MedsTheme.colors.primaryDark} />
        </View>
        <Text style={styles.title}>Bạn là bệnh nhân</Text>
        <Text style={styles.desc}>Vào giao diện cá nhân để xem lịch uống thuốc, nhắc uống và báo cáo.</Text>
        <ActionButton label="Vào trang Home" onPress={() => void choosePortal('patient')} />
      </SectionCard>

      <SectionCard style={styles.card}>
        <View style={styles.iconWrap}>
          <Ionicons name="people" size={20} color={MedsTheme.colors.primaryDark} />
        </View>
        <Text style={styles.title}>Bạn là người thân chăm sóc</Text>
        <Text style={styles.desc}>Vào dashboard theo dõi bệnh nhân, nhận cảnh báo và hỗ trợ từ xa.</Text>
        <ActionButton
          label={isCheckingPatients ? 'Đang kiểm tra liên kết...' : 'Vào trang Caregiver'}
          onPress={() => void choosePortal('caregiver')}
        />
      </SectionCard>
      <FeedbackToast message={feedbackMessage} tone="warning" onHide={() => setFeedbackMessage(null)} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 8,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E9F2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: MedsTheme.colors.textMain,
    fontSize: 18,
    fontWeight: '800',
  },
  desc: {
    color: MedsTheme.colors.textMuted,
    lineHeight: 20,
  },
});
