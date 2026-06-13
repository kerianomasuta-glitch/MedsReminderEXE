import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ActionButton, AppScreen, ChoiceChip, PageHeader, SectionCard } from '@/components/meds/ui-kit';
import { reminderIntervals } from '@/constants/app-mock';
import { MedsTheme } from '@/constants/meds-theme';

export default function NotificationSettingsScreen() {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrateEnabled, setVibrateEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [remindInterval, setRemindInterval] = useState('15p');
  const [caregiverAlert, setCaregiverAlert] = useState('30p');

  return (
    <AppScreen>
      <PageHeader title="Cài đặt thông báo" subtitle="Tùy chỉnh nhắc thuốc và cảnh báo cho người thân." />

      <SectionCard>
        <SettingSwitch label="Bật/tắt push notification" value={pushEnabled} onToggle={() => setPushEnabled((prev) => !prev)} />
        <SettingSwitch label="Âm báo nhắc thuốc" value={soundEnabled} onToggle={() => setSoundEnabled((prev) => !prev)} />
        <SettingSwitch label="Rung khi nhắc" value={vibrateEnabled} onToggle={() => setVibrateEnabled((prev) => !prev)} />
      </SectionCard>

      <SectionCard>
        <Text style={styles.title}>Khoảng thời gian nhắc lại mặc định</Text>
        <View style={styles.row}>
          {reminderIntervals.map((item) => (
            <ChoiceChip key={item} label={item} active={remindInterval === item} onPress={() => setRemindInterval(item)} />
          ))}
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={styles.title}>Gửi cảnh báo cho người thân sau</Text>
        <View style={styles.row}>
          {['15p', '30p', '60p'].map((item) => (
            <ChoiceChip key={item} label={item} active={caregiverAlert === item} onPress={() => setCaregiverAlert(item)} />
          ))}
        </View>
      </SectionCard>

      <SectionCard>
        <View style={styles.inlineHead}>
          <Text style={styles.title}>SMS reminder</Text>
          <Text style={styles.premium}>Premium</Text>
        </View>
        <SettingSwitch label="Bật/tắt SMS reminder" value={smsEnabled} onToggle={() => setSmsEnabled((prev) => !prev)} />

        <View style={styles.inlineHead}>
          <Text style={styles.title}>Voice reminder của người thân</Text>
          <Text style={styles.premium}>Premium</Text>
        </View>
        <SettingSwitch label="Upload/record voice" value={voiceEnabled} onToggle={() => setVoiceEnabled((prev) => !prev)} />
      </SectionCard>

      <ActionButton label="Lưu cài đặt" />
    </AppScreen>
  );
}

function SettingSwitch({ label, value, onToggle }: { label: string; value: boolean; onToggle: () => void }) {
  return (
    <Pressable style={styles.switchRow} onPress={onToggle}>
      <Text style={styles.switchLabel}>{label}</Text>
      <View style={[styles.switch, value && styles.switchOn]}>
        <View style={[styles.switchThumb, value && styles.switchThumbOn]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  title: {
    color: MedsTheme.colors.textMain,
    fontSize: 15,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  switchRow: {
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: MedsTheme.colors.border,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  switchLabel: {
    flex: 1,
    color: MedsTheme.colors.textMain,
    fontWeight: '600',
  },
  switch: {
    width: 46,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#D8E0EC',
    padding: 2,
  },
  switchOn: {
    backgroundColor: '#7CB6FA',
  },
  switchThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
  },
  switchThumbOn: {
    marginLeft: 20,
  },
  inlineHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  premium: {
    borderRadius: 999,
    backgroundColor: '#FFF0D9',
    color: '#A66100',
    fontWeight: '700',
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});
