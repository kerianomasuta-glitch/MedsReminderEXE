import { router, Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import {
  FeatureNavCard,
  formatPatientGender,
  PatientProfileHero,
  SectionHeader,
} from '@/components/meds/caregiver-ui';
import { AppScreen } from '@/components/meds/ui-kit';
import { MedsTheme } from '@/constants/meds-theme';

export default function CaregiverPatientScreen() {
  const { id, name, gender, birthday } = useLocalSearchParams<{
    id: string;
    name?: string;
    gender?: string;
    birthday?: string;
  }>();

  const patientName = name?.trim() || 'Bệnh nhân';
  const birthdayLabel = birthday ? new Date(birthday).toLocaleDateString('vi-VN') : 'Chưa có ngày sinh';
  const profileMeta = `${formatPatientGender(gender)} · Sinh ${birthdayLabel}`;

  return (
    <AppScreen hero paddedBottom={40}>
      <Stack.Screen options={{ title: patientName, headerShadowVisible: false }} />

      <PatientProfileHero name={patientName} meta={profileMeta} />

      <View style={styles.section}>
        <SectionHeader title="Quản lý bệnh nhân" icon="medkit-outline" />
        <Text style={styles.sectionHint}>Chọn mục bên dưới để xem và cập nhật thông tin y tế.</Text>

        <FeatureNavCard
          title="Quản lý đơn thuốc"
          subtitle="Xem, thêm và chỉnh sửa đơn thuốc của bệnh nhân"
          icon="document-text"
          accent={MedsTheme.colors.textLink}
          accentSoft="#E8F4FF"
          onPress={() =>
            router.push({
              pathname: '/caregiver/patient/[id]/prescriptions',
              params: { id, name: patientName },
            })
          }
        />

        <FeatureNavCard
          title="Quản lý lịch uống thuốc"
          subtitle="Thiết lập nhắc nhở và theo dõi lịch uống hàng ngày"
          icon="calendar"
          accent={MedsTheme.colors.semanticSuccess}
          accentSoft="#ECFDF3"
          onPress={() =>
            router.push({
              pathname: '/caregiver/patient/[id]/schedule',
              params: { id, name: patientName },
            })
          }
        />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: MedsTheme.spacing.sm,
  },
  sectionHint: {
    fontSize: 14,
    fontFamily: MedsTheme.fonts.sans,
    color: MedsTheme.colors.body,
    lineHeight: 20,
    marginBottom: MedsTheme.spacing.xxs,
  },
});
