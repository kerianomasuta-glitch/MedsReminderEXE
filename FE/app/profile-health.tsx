import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PatientAvatar } from '@/components/meds/caregiver-ui';
import { DepthButton, DepthCard, DepthPressable, StaggerIn } from '@/components/meds/depth-ui';
import { FeedbackToast } from '@/components/meds/feedback-toast';
import { DepthChip, SectionLabel, SubScreen, SubScreenIntro } from '@/components/meds/sub-screen-ui';
import { TextField } from '@/components/meds/ui-kit';
import { healthOptions } from '@/constants/app-mock';
import { MedsTheme } from '@/constants/meds-theme';
import { updateProfileHealth, useProfileHealth } from '@/store/profile-health-store';

const { colors, typography, radius, spacing, fonts } = MedsTheme;

export default function ProfileHealthScreen() {
  const profile = useProfileHealth();
  const [name, setName] = useState(profile.name);
  const [age, setAge] = useState(profile.age);
  const [birthday, setBirthday] = useState(profile.birthday);
  const [gender, setGender] = useState(profile.gender);
  const [phone, setPhone] = useState(profile.phone);
  const [email, setEmail] = useState(profile.email);
  const [allergies, setAllergies] = useState(profile.allergies);
  const [notes, setNotes] = useState(profile.notes);
  const [emergencyContact, setEmergencyContact] = useState(profile.emergencyContact);
  const [emergencyPhone, setEmergencyPhone] = useState(profile.emergencyPhone);
  const [selected, setSelected] = useState<string[]>([...profile.conditions]);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const toggleCondition = (item: string) => {
    setSelected((prev) => (prev.includes(item) ? prev.filter((value) => value !== item) : [...prev, item]));
  };

  const handleSave = () => {
    updateProfileHealth({
      name: name.trim(),
      age: age.trim(),
      birthday: birthday.trim(),
      gender: gender.trim(),
      phone: phone.trim(),
      email: email.trim(),
      emergencyContact: emergencyContact.trim(),
      emergencyPhone: emergencyPhone.trim(),
      conditions: selected,
      allergies: allergies.trim(),
      notes: notes.trim(),
    });
    setSavedMessage('Đã lưu hồ sơ sức khỏe thành công.');
  };

  return (
    <SubScreen paddedBottom={40}>
      <Stack.Screen options={{ headerStyle: { backgroundColor: colors.canvasSoft } }} />
      <SubScreenIntro subtitle="Cập nhật thông tin cá nhân và tình trạng sức khỏe của bạn." />

      <StaggerIn index={0}>
        <DepthCard style={styles.card}>
          <SectionLabel text="THÔNG TIN CÁ NHÂN" />
          <View style={styles.avatarRow}>
            <View style={styles.avatarRing}>
              <PatientAvatar name={name || 'Bệnh nhân'} size={72} />
            </View>
            <View style={styles.avatarInfo}>
              <Text style={styles.avatarName}>{name || 'Bệnh nhân'}</Text>
              <DepthPressable depth="sm">
                <View style={styles.avatarAction}>
                  <Ionicons name="camera-outline" size={14} color={colors.brandName} />
                  <Text style={styles.avatarActionText}>Đổi avatar</Text>
                </View>
              </DepthPressable>
            </View>
          </View>

          <TextField label="Họ tên" value={name} onChangeText={setName} />
          <View style={styles.fieldRow}>
            <View style={styles.fieldHalf}>
              <TextField label="Tuổi" value={age} onChangeText={setAge} />
            </View>
            <View style={styles.fieldHalf}>
              <TextField label="Giới tính" value={gender} onChangeText={setGender} />
            </View>
          </View>
          <TextField label="Ngày sinh" value={birthday} onChangeText={setBirthday} placeholder="YYYY-MM-DD" />
          <TextField label="Số điện thoại" value={phone} onChangeText={setPhone} />
          <TextField label="Email" value={email} onChangeText={setEmail} />
        </DepthCard>
      </StaggerIn>

      <StaggerIn index={1}>
        <DepthCard style={styles.card}>
          <SectionLabel text="TÌNH TRẠNG SỨC KHỎE" />
          <Text style={styles.fieldGroupLabel}>Bệnh nền</Text>
          <View style={styles.chipWrap}>
            {healthOptions.map((item) => (
              <DepthChip key={item} label={item} active={selected.includes(item)} onPress={() => toggleCondition(item)} />
            ))}
          </View>
          <TextField label="Dị ứng thuốc" value={allergies} onChangeText={setAllergies} />
          <TextField
            label="Ghi chú sức khỏe"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            style={styles.noteInput}
          />
        </DepthCard>
      </StaggerIn>

      <StaggerIn index={2}>
        <DepthCard style={styles.card}>
          <SectionLabel text="LIÊN HỆ KHẨN CẤP" />
          <TextField label="Người liên hệ khẩn cấp" value={emergencyContact} onChangeText={setEmergencyContact} />
          <TextField label="Số điện thoại khẩn cấp" value={emergencyPhone} onChangeText={setEmergencyPhone} />
        </DepthCard>
      </StaggerIn>

      <DepthButton
        label="Lưu thay đổi"
        tone="brand"
        icon={<Ionicons name="checkmark-circle" size={18} color={colors.onPrimary} />}
        onPress={handleSave}
      />
      <FeedbackToast message={savedMessage} onHide={() => setSavedMessage(null)} />
    </SubScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.base,
    gap: spacing.sm,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xxs,
  },
  avatarRing: {
    padding: 3,
    borderRadius: 40,
    backgroundColor: colors.brandNameSoft,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
    ...MedsTheme.elevation.card,
  },
  avatarInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  avatarName: {
    ...typography.titleMd,
    fontFamily: fonts.sansSemiBold,
    color: colors.ink,
  },
  avatarAction: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.brandNameSoft,
    borderWidth: 1,
    borderColor: 'rgba(27, 61, 110, 0.12)',
  },
  avatarActionText: {
    ...typography.caption,
    fontFamily: fonts.sansSemiBold,
    color: colors.brandName,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  fieldHalf: {
    flex: 1,
  },
  fieldGroupLabel: {
    ...typography.titleSm,
    fontFamily: fonts.sansSemiBold,
    color: colors.ink,
    marginBottom: -4,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  noteInput: {
    minHeight: 96,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
});
