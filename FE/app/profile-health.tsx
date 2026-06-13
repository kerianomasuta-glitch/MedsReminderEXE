import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ActionButton, AppScreen, ChoiceChip, PageHeader, SectionCard, TextField } from '@/components/meds/ui-kit';
import { userMock } from '@/constants/app-mock';
import { MedsTheme } from '@/constants/meds-theme';

const healthOptions = ['Huyết áp', 'Tiểu đường', 'Tim mạch', 'Hen suyễn', 'Khác'];

export default function ProfileHealthScreen() {
  const [selected, setSelected] = useState<string[]>([...userMock.conditions]);

  const toggleCondition = (item: string) => {
    setSelected((prev) => (prev.includes(item) ? prev.filter((value) => value !== item) : [...prev, item]));
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

        <TextField label="Họ tên" value={userMock.name} />
        <TextField label="Tuổi / ngày sinh" value={`${userMock.age} - ${userMock.birthday}`} />
        <TextField label="Giới tính" value={userMock.gender} />
        <TextField label="Số điện thoại" value={userMock.phone} />
        <TextField label="Email" value={userMock.email} />
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Thông tin sức khỏe</Text>
        <Text style={styles.label}>Bệnh nền</Text>
        <View style={styles.chipWrap}>
          {healthOptions.map((item) => (
            <ChoiceChip key={item} label={item} active={selected.includes(item)} onPress={() => toggleCondition(item)} />
          ))}
        </View>
        <TextField label="Dị ứng thuốc" value={userMock.allergies} />
        <TextField label="Ghi chú sức khỏe" value={userMock.notes} multiline numberOfLines={4} style={styles.noteInput} />
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>Liên hệ khẩn cấp</Text>
        <TextField label="Người liên hệ khẩn cấp" value={userMock.emergencyContact} />
        <TextField label="Số điện thoại khẩn cấp" value={userMock.emergencyPhone} />
      </SectionCard>

      <ActionButton
        label="Lưu thay đổi"
        icon={<Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />}
      />
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
