import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { ActionButton, AppScreen, ChoiceChip, PageHeader, SectionCard, TextField } from '@/components/meds/ui-kit';
import { caregiverMock } from '@/constants/app-mock';
import { MedsTheme } from '@/constants/meds-theme';

const permissionOptions = ['Xem lịch uống cơ bản', 'Nhận cảnh báo khi quên thuốc', 'Xem báo cáo tuân thủ'];

export default function CaregiverManagementScreen() {
  const [showInvite, setShowInvite] = useState(false);
  const [permissions, setPermissions] = useState<string[]>([permissionOptions[0], permissionOptions[1]]);

  const togglePermission = (value: string) => {
    setPermissions((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
  };

  return (
    <AppScreen>
      <PageHeader
        title="Người thân theo dõi"
        subtitle="Mời người thân theo dõi lịch thuốc bằng email/số điện thoại, mã mời hoặc QR."
      />

      {caregiverMock.map((item) => (
        <SectionCard key={item.id}>
          <View style={styles.cardHead}>
            <View>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.contact}>{item.contact} - {item.email}</Text>
            </View>
            <View style={[styles.statusBadge, item.status === 'Đã liên kết' ? styles.statusLinked : styles.statusPending]}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
          <ActionButton label="Hủy liên kết" tone="danger" />
        </SectionCard>
      ))}

      <ActionButton
        label="Mời người thân"
        icon={<Ionicons name="person-add" size={18} color="#FFFFFF" />}
        onPress={() => setShowInvite(true)}
      />

      <Modal visible={showInvite} transparent animationType="fade" onRequestClose={() => setShowInvite(false)}>
        <View style={styles.overlay}>
          <SectionCard style={styles.modalCard}>
            <Text style={styles.modalTitle}>Mời người thân</Text>
            <TextField label="Email hoặc số điện thoại" placeholder="example@mail.com hoặc 09xxxxxxxx" />
            <SectionCard style={styles.codeCard}>
              <Text style={styles.inviteCode}>Mã mời: MEDS-2026-8821</Text>
              <View style={styles.qrPlaceholder}>
                <Ionicons name="qr-code" size={44} color={MedsTheme.colors.primaryDark} />
                <Text style={styles.qrText}>QR liên kết demo</Text>
              </View>
            </SectionCard>

            <Text style={styles.permissionTitle}>Quyền truy cập</Text>
            <View style={styles.permissionWrap}>
              {permissionOptions.map((item) => (
                <ChoiceChip
                  key={item}
                  label={item}
                  active={permissions.includes(item)}
                  onPress={() => togglePermission(item)}
                />
              ))}
            </View>

            <ActionButton label="Gửi lời mời" />
            <Pressable onPress={() => setShowInvite(false)} style={styles.closeWrap}>
              <Text style={styles.closeText}>Đóng</Text>
            </Pressable>
          </SectionCard>
        </View>
      </Modal>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  cardHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  name: {
    color: MedsTheme.colors.textMain,
    fontSize: 18,
    fontWeight: '800',
  },
  contact: {
    marginTop: 2,
    color: MedsTheme.colors.textMuted,
    fontSize: 13,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  statusLinked: {
    backgroundColor: '#DCF5E8',
  },
  statusPending: {
    backgroundColor: '#FFF1DD',
  },
  statusText: {
    color: MedsTheme.colors.textMain,
    fontSize: 12,
    fontWeight: '700',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(6, 18, 35, 0.5)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  modalCard: {
    gap: 12,
  },
  modalTitle: {
    color: MedsTheme.colors.textMain,
    fontSize: 23,
    fontWeight: '800',
  },
  codeCard: {
    backgroundColor: '#F8FBFF',
    borderStyle: 'dashed',
  },
  inviteCode: {
    color: MedsTheme.colors.primaryDark,
    fontSize: 16,
    fontWeight: '700',
  },
  qrPlaceholder: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: MedsTheme.colors.border,
    backgroundColor: '#FFFFFF',
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  qrText: {
    color: MedsTheme.colors.textMuted,
  },
  permissionTitle: {
    color: MedsTheme.colors.textMain,
    fontSize: 15,
    fontWeight: '700',
  },
  permissionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  closeWrap: {
    alignItems: 'center',
  },
  closeText: {
    color: MedsTheme.colors.primaryDark,
    fontWeight: '700',
  },
});
