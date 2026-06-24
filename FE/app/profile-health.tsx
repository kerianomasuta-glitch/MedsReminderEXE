import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FeedbackToast } from '@/components/meds/feedback-toast';
import { ActionButton, AppScreen, ChoiceChip, PageHeader, SectionCard, TextField } from '@/components/meds/ui-kit';
import { healthOptions } from '@/constants/app-mock';
import { MedsTheme } from '@/constants/meds-theme';
import { updateProfileHealth, useProfileHealth } from '@/store/profile-health-store';

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
    <AppScreen>
      <PageHeader title="Hồ sơ sức khỏe" subtitle="Cập nhật thông tin cá nhân và tình trạng sức khỏe." />

      <SectionCard>
        <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
        <View style={styles.avatarRow}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={30} color={MedsTheme.colors.primaryDark} />
          </View>
          <Pressable style={styles.avatarAction}>
            <Text style={styles.avatarActionText}>Đổi avatar</Text>
          </Pressable>
        </View>

        <TextField label="Họ tên" value={name} onChangeText={setName} />
        <TextField label="Tuổi" value={age} onChangeText={setAge} />
        <TextField label="Ngày sinh" value={birthday} onChangeText={setBirthday} placeholder="YYYY-MM-DD" />
        <TextField label="Giới tính" value={gender} onChangeText={setGender} />
        <TextField label="Số điện thoại" value={phone} onChangeText={setPhone} />
        <TextField label="Email" value={email} onChangeText={setEmail} />
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Thông tin sức khỏe</Text>
        <Text style={styles.label}>Bệnh nền</Text>
        <View style={styles.chipWrap}>
          {healthOptions.map((item) => (
            <ChoiceChip key={item} label={item} active={selected.includes(item)} onPress={() => toggleCondition(item)} />
          ))}
        </View>
        <TextField label="Dị ứng thuốc" value={allergies} onChangeText={setAllergies} />
        <TextField label="Ghi chú sức khỏe" value={notes} onChangeText={setNotes} multiline numberOfLines={4} style={styles.noteInput} />
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Liên hệ khẩn cấp</Text>
        <TextField label="Người liên hệ khẩn cấp" value={emergencyContact} onChangeText={setEmergencyContact} />
        <TextField label="Số điện thoại khẩn cấp" value={emergencyPhone} onChangeText={setEmergencyPhone} />
      </SectionCard>

      <ActionButton
        label="Lưu thay đổi"
        icon={<Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />}
        onPress={handleSave}
      />
      <FeedbackToast message={savedMessage} onHide={() => setSavedMessage(null)} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: MedsTheme.colors.textMain,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#DCEEFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarAction: {
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: MedsTheme.colors.border,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  avatarActionText: {
    color: MedsTheme.colors.primaryDark,
    fontWeight: '700',
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: MedsTheme.colors.textMain,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  noteInput: {
    minHeight: 90,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
});
