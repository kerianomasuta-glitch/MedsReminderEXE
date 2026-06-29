import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  CaregiverLogoutButton,
  DashboardWelcomeBanner,
  formatPatientGender,
  PatientListCard,
  SectionHeader,
} from '@/components/meds/caregiver-ui';
import { FeedbackToast } from '@/components/meds/feedback-toast';
import { ActionButton, AppScreen, ChoiceChip, SectionCard, TextField } from '@/components/meds/ui-kit';
import { MedsTheme } from '@/constants/meds-theme';
import { createPatientApi, getMyPatientsApi, type AuthUser } from '@/services/auth-api';
import { useAuth } from '@/store/auth-store';

export default function CaregiverDashboardScreen() {
  const { accessToken, logout } = useAuth();
  const [patients, setPatients] = useState<Array<{ mappingId: string; linkedAt: string; patient: AuthUser }>>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [isCreatingPatient, setIsCreatingPatient] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [name, setName] = useState('');
  const [authPin, setAuthPin] = useState('');
  const [birthday, setBirthday] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | ''>('');
  const [triedSubmit, setTriedSubmit] = useState(false);
  const [serverPinError, setServerPinError] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const loadPatients = async () => {
    if (!accessToken) return;
    try {
      setIsLoadingPatients(true);
      const response = await getMyPatientsApi({ accessToken });
      setPatients(response.data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không tải được danh sách bệnh nhân';
      setFeedbackMessage(message);
    } finally {
      setIsLoadingPatients(false);
    }
  };

  useEffect(() => {
    void loadPatients();
  }, [accessToken]);

  const nameError = triedSubmit && !name.trim() ? 'Vui lòng nhập họ tên bệnh nhân.' : undefined;
  const authPinError = triedSubmit && !/^\d{4}$/.test(authPin.trim())
    ? 'Mã PIN phải gồm đúng 4 chữ số.'
    : serverPinError ?? undefined;
  const birthdayError =
    triedSubmit && birthday.trim() && !/^\d{4}-\d{2}-\d{2}$/.test(birthday.trim())
      ? 'Ngày sinh phải theo định dạng YYYY-MM-DD.'
      : undefined;

  const submitCreatePatient = async () => {
    if (isCreatingPatient) return;
    setTriedSubmit(true);
    if (nameError || authPinError || birthdayError) return;
    if (!accessToken) {
      setFeedbackMessage('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.');
      return;
    }

    try {
      setIsCreatingPatient(true);
      await createPatientApi({
        accessToken,
        payload: {
          name: name.trim(),
          authPin: authPin.trim(),
          birthday: birthday.trim() || undefined,
          gender: gender || undefined,
        },
      });
      setName('');
      setAuthPin('');
      setBirthday('');
      setGender('');
      setTriedSubmit(false);
      setServerPinError(null);
      setShowCreateForm(false);
      setFeedbackMessage('Đăng ký bệnh nhân thành công');
      await loadPatients();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể tạo bệnh nhân';
      if (message.toLowerCase().includes('mã pin')) {
        setServerPinError(message);
      }
      setFeedbackMessage(message);
    } finally {
      setIsCreatingPatient(false);
    }
  };

  const navigateToPatient = (item: { patient: AuthUser }) => {
    const patientId = item.patient?._id;
    if (!patientId) return;
    router.push({
      pathname: '/caregiver/patient/[id]',
      params: {
        id: patientId,
        name: item.patient?.name ?? 'Bệnh nhân',
        gender: item.patient?.gender ?? '',
        birthday: item.patient?.birthday ? String(item.patient.birthday) : '',
      },
    });
  };

  return (
    <AppScreen hero paddedBottom={40}>
      <Stack.Screen
        options={{
          headerRight: () => <CaregiverLogoutButton onPress={() => void logout()} />,
        }}
      />

      <DashboardWelcomeBanner patientCount={patients.length} loading={isLoadingPatients} />

      <SectionCard style={styles.registerCard}>
        <SectionHeader
          title="Đăng ký người bệnh"
          icon="person-add-outline"
          action={
            <Pressable
              onPress={() => setShowCreateForm((prev) => !prev)}
              style={({ pressed }) => [styles.toggleBtn, pressed && styles.toggleBtnPressed]}>
              <Ionicons name={showCreateForm ? 'chevron-up' : 'add-circle'} size={18} color={MedsTheme.colors.textLink} />
              <Text style={styles.toggleBtnText}>{showCreateForm ? 'Thu gọn' : 'Thêm mới'}</Text>
            </Pressable>
          }
        />
        {showCreateForm ? (
          <View style={styles.formWrap}>
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
              onChangeText={(value) => {
                setAuthPin(value);
                if (serverPinError) setServerPinError(null);
              }}
              placeholder="4 chữ số"
              keyboardType="number-pad"
              error={authPinError}
              hint="PIN phải duy nhất trong danh sách bệnh nhân của caregiver."
            />
            <TextField
              label="Ngày sinh (không bắt buộc)"
              value={birthday}
              onChangeText={setBirthday}
              placeholder="YYYY-MM-DD"
              error={birthdayError}
            />
            <Text style={styles.genderLabel}>Giới tính (không bắt buộc)</Text>
            <View style={styles.genderRow}>
              <ChoiceChip label="Nam" active={gender === 'male'} onPress={() => setGender('male')} />
              <ChoiceChip label="Nữ" active={gender === 'female'} onPress={() => setGender('female')} />
              <ChoiceChip label="Khác" active={gender === 'other'} onPress={() => setGender('other')} />
            </View>
            <ActionButton
              label={isCreatingPatient ? 'Đang tạo bệnh nhân...' : 'Tạo bệnh nhân'}
              icon={<Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />}
              onPress={submitCreatePatient}
            />
          </View>
        ) : (
          <Text style={styles.registerHint}>Nhấn "Thêm mới" để đăng ký tài khoản bệnh nhân và liên kết với bạn.</Text>
        )}
      </SectionCard>

      <View style={styles.listSection}>
        <SectionHeader title="Danh sách bệnh nhân" icon="people-outline" />
        {isLoadingPatients ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={MedsTheme.colors.ink} />
            <Text style={styles.loadingText}>Đang tải danh sách...</Text>
          </View>
        ) : patients.length ? (
          <View style={styles.patientList}>
            {patients.map((item) => {
              const patientName = item.patient?.name ?? 'Bệnh nhân';
              const birthdayLabel = item.patient?.birthday
                ? new Date(item.patient.birthday as string).toLocaleDateString('vi-VN')
                : 'Chưa có ngày sinh';
              const meta = `${formatPatientGender(item.patient?.gender)} · ${birthdayLabel}`;

              return (
                <PatientListCard
                  key={item.mappingId}
                  name={patientName}
                  meta={meta}
                  onPress={() => navigateToPatient(item)}
                />
              );
            })}
          </View>
        ) : (
          <SectionCard>
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIcon}>
                <Ionicons name="heart-outline" size={28} color={MedsTheme.colors.textLink} />
              </View>
              <Text style={styles.emptyTitle}>Chưa có bệnh nhân</Text>
              <Text style={styles.emptyText}>Đăng ký người thân đầu tiên để bắt đầu theo dõi lịch uống thuốc.</Text>
            </View>
          </SectionCard>
        )}
      </View>

      <FeedbackToast message={feedbackMessage} tone="warning" onHide={() => setFeedbackMessage(null)} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  registerCard: {
    marginTop: MedsTheme.spacing.xxs,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: MedsTheme.radius.pill,
    backgroundColor: '#E8F4FF',
  },
  toggleBtnPressed: {
    opacity: 0.85,
  },
  toggleBtnText: {
    fontSize: 13,
    fontFamily: MedsTheme.fonts.sansMedium,
    color: MedsTheme.colors.textLink,
  },
  formWrap: {
    gap: MedsTheme.spacing.sm,
  },
  registerHint: {
    fontSize: 14,
    fontFamily: MedsTheme.fonts.sans,
    color: MedsTheme.colors.body,
    lineHeight: 20,
  },
  genderLabel: {
    color: MedsTheme.colors.textMain,
    fontSize: 15,
    fontFamily: MedsTheme.fonts.sansSemiBold,
  },
  genderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  listSection: {
    gap: MedsTheme.spacing.sm,
  },
  patientList: {
    gap: MedsTheme.spacing.sm,
  },
  loadingWrap: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: MedsTheme.fonts.sans,
    color: MedsTheme.colors.body,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: MedsTheme.spacing.base,
    gap: MedsTheme.spacing.xs,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E8F4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: MedsTheme.fonts.sansSemiBold,
    color: MedsTheme.colors.ink,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: MedsTheme.fonts.sans,
    color: MedsTheme.colors.body,
    textAlign: 'center',
    lineHeight: 20,
  },
});
