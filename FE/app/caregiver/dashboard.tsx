import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FeedbackToast } from '@/components/meds/feedback-toast';
import { ActionButton, AppScreen, ChoiceChip, PageHeader, SectionCard, TextField } from '@/components/meds/ui-kit';
import { medicineMock, reportMock } from '@/constants/app-mock';
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

  return (
    <AppScreen>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable style={styles.headerLogoutButton} onPress={() => void logout()} hitSlop={10}>
              <Ionicons name="log-out-outline" size={20} color={MedsTheme.colors.textMain} />
            </Pressable>
          ),
          headerRightContainerStyle: {
            paddingRight: 8,
          },
        }}
      />
      <PageHeader title="Theo dõi người thân" subtitle="Theo dõi trạng thái uống thuốc hằng ngày của người thân." />

      <SectionCard>
        <Text style={styles.sectionTitle}>Đăng ký người bệnh mới</Text>
        <ActionButton
          label={showCreateForm ? 'Ẩn form đăng ký' : 'Đăng ký người bệnh'}
          tone={showCreateForm ? 'secondary' : 'primary'}
          onPress={() => setShowCreateForm((prev) => !prev)}
        />
        {showCreateForm ? (
          <>
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
            <ActionButton label={isCreatingPatient ? 'Đang tạo bệnh nhân...' : 'Tạo bệnh nhân'} onPress={submitCreatePatient} />
          </>
        ) : null}
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Danh sách bệnh nhân của bạn</Text>
        {isLoadingPatients ? (
          <Text style={styles.patientMeta}>Đang tải danh sách bệnh nhân...</Text>
        ) : patients.length ? (
          patients.map((item) => (
            <View key={item.mappingId} style={styles.patientRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="person" size={14} color={MedsTheme.colors.primaryDark} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.patientName}>{item.patient?.name ?? 'Bệnh nhân'}</Text>
                <Text style={styles.patientMeta}>
                  {item.patient?.gender ?? 'Không rõ giới tính'} - {item.patient?.birthday ? new Date(item.patient.birthday as string).toLocaleDateString('vi-VN') : 'Chưa có ngày sinh'}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyWrap}>
            <Text style={styles.patientMeta}>Bạn chưa liên kết bệnh nhân nào.</Text>
          </View>
        )}
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Today Medication Status</Text>
        <View style={styles.statsRow}>
          <StatBox label="Đã uống" value="2" tone="#E4F4EC" />
          <StatBox label="Sắp tới" value="1" tone="#E7F1FF" />
          <StatBox label="Bỏ qua" value="1" tone="#FCEDEF" />
          <StatBox label="Trễ giờ" value="1" tone="#FFF2DF" />
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Thuốc hôm nay</Text>
        {medicineMock.map((item) => (
          <View key={item.id} style={styles.medicineRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="medical" size={14} color={MedsTheme.colors.primaryDark} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.medicineName}>{item.name}</Text>
              <Text style={styles.medicineMeta}>{item.time} - {item.dose}</Text>
            </View>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        ))}
      </SectionCard>

      <SectionCard style={styles.alertCard}>
        <Text style={styles.alertTitle}>Cảnh báo nổi bật</Text>
        <Text style={styles.alertText}>Thuốc huyết áp chưa được xác nhận lúc 06:00 PM.</Text>
      </SectionCard>

      <View style={styles.actionRow}>
        <ActionButton label="Gọi nhắc nhở" tone="warning" onPress={() => router.push('/reminder')} />
        <ActionButton label="Gửi lời nhắn" tone="secondary" onPress={() => router.push('/ai-assistant')} />
      </View>

      <SectionCard>
        <Text style={styles.sectionTitle}>Tuân thủ tuần này</Text>
        <Text style={styles.percent}>{reportMock.weeklyPercent}%</Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Cảnh báo gần đây</Text>
        <Pressable style={styles.timelineRow} onPress={() => router.push('/missed-alert')}>
          <Text style={styles.timelineTime}>18:25</Text>
          <Text style={styles.timelineText}>Thuốc huyết áp - chưa xác nhận</Text>
        </Pressable>
      </SectionCard>
      <FeedbackToast message={feedbackMessage} tone="warning" onHide={() => setFeedbackMessage(null)} />
    </AppScreen>
  );
}

function StatBox({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <View style={[styles.statBox, { backgroundColor: tone }]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerLogoutButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  patientName: {
    fontSize: 21,
    fontWeight: '800',
    color: MedsTheme.colors.textMain,
  },
  patientMeta: {
    marginTop: 2,
    color: MedsTheme.colors.textMuted,
  },
  patientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 44,
  },
  emptyWrap: {
    gap: 10,
  },
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
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: MedsTheme.colors.textMain,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statBox: {
    width: '48.5%',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDE6F3',
  },
  statValue: {
    color: MedsTheme.colors.textMain,
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    color: MedsTheme.colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  medicineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 46,
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  medicineName: {
    color: MedsTheme.colors.textMain,
    fontWeight: '700',
  },
  medicineMeta: {
    color: MedsTheme.colors.textMuted,
    fontSize: 12,
  },
  statusText: {
    color: MedsTheme.colors.primaryDark,
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  alertCard: {
    backgroundColor: '#FFF0F1',
    borderColor: '#F8CCCF',
  },
  alertTitle: {
    color: '#A92F3F',
    fontSize: 18,
    fontWeight: '800',
  },
  alertText: {
    color: '#8C4451',
  },
  actionRow: {
    gap: 8,
  },
  percent: {
    fontSize: 40,
    fontWeight: '800',
    color: MedsTheme.colors.primaryDark,
  },
  timelineRow: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: MedsTheme.colors.border,
    padding: 10,
    flexDirection: 'row',
    gap: 10,
  },
  timelineTime: {
    width: 44,
    color: MedsTheme.colors.primaryDark,
    fontWeight: '700',
  },
  timelineText: {
    flex: 1,
    color: MedsTheme.colors.textMain,
  },
});
