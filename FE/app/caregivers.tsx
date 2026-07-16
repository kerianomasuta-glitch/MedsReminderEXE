import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { PatientAvatar } from '@/components/meds/caregiver-ui';
import { DepthButton, DepthCard, DepthPressable, StaggerIn } from '@/components/meds/depth-ui';
import { DepthChip, SectionLabel, SubScreen, SubScreenIntro } from '@/components/meds/sub-screen-ui';
import { TextField } from '@/components/meds/ui-kit';
import { caregiverInviteMock, caregiverMock, caregiverPermissionOptions } from '@/constants/app-mock';
import { MedsTheme } from '@/constants/meds-theme';

const { colors, typography, radius, spacing, fonts } = MedsTheme;

function CaregiverCard({
  name,
  contact,
  email,
  status,
  onUnlink,
}: {
  name: string;
  contact: string;
  email: string;
  status: string;
  onUnlink?: () => void;
}) {
  const linked = status === 'Đã liên kết';

  return (
    <DepthCard style={styles.caregiverCard}>
      <View style={styles.caregiverTop}>
        <PatientAvatar name={name} size={52} />
        <View style={styles.caregiverInfo}>
          <Text style={styles.caregiverName}>{name}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="call-outline" size={13} color={colors.muted} />
            <Text style={styles.caregiverMeta}>{contact}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="mail-outline" size={13} color={colors.muted} />
            <Text style={styles.caregiverMeta} numberOfLines={1}>
              {email}
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, linked ? styles.statusLinked : styles.statusPending]}>
          <View style={[styles.statusDot, { backgroundColor: linked ? colors.semanticSuccess : colors.accentWarning }]} />
          <Text style={[styles.statusText, linked ? styles.statusTextLinked : styles.statusTextPending]}>{status}</Text>
        </View>
      </View>

      <DepthPressable depth="sm" onPress={onUnlink}>
        <View style={styles.unlinkBtn}>
          <Ionicons name="person-remove-outline" size={16} color={colors.critical} />
          <Text style={styles.unlinkText}>Hủy liên kết</Text>
        </View>
      </DepthPressable>
    </DepthCard>
  );
}

export default function CaregiverManagementScreen() {
  const [showInvite, setShowInvite] = useState(false);
  const [permissions, setPermissions] = useState<string[]>([
    caregiverPermissionOptions[0],
    caregiverPermissionOptions[1],
  ]);

  const togglePermission = (value: string) => {
    setPermissions((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
  };

  return (
    <SubScreen>
      <Stack.Screen options={{ headerStyle: { backgroundColor: colors.canvasSoft } }} />
      <SubScreenIntro subtitle="Mời người thân theo dõi lịch thuốc bằng email, số điện thoại, mã mời hoặc QR." />

      {caregiverMock.map((item, index) => (
        <StaggerIn key={item.id} index={index}>
          <CaregiverCard
            name={item.name}
            contact={item.contact}
            email={item.email}
            status={item.status}
          />
        </StaggerIn>
      ))}

      <DepthButton
        label="Mời người thân"
        tone="brand"
        icon={<Ionicons name="person-add" size={18} color={colors.onPrimary} />}
        onPress={() => setShowInvite(true)}
      />

      <Modal visible={showInvite} transparent animationType="fade" onRequestClose={() => setShowInvite(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowInvite(false)}>
          <Pressable style={styles.modalStop} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalPlate} />
            <View style={styles.modalShell}>
              <LinearGradient colors={['#FFFFFF', colors.canvasSoft]} style={styles.modalCard}>
                <Text style={styles.modalTitle}>Mời người thân</Text>
                <Text style={styles.modalSubtitle}>Gửi lời mời qua email hoặc số điện thoại</Text>

                <TextField label="Email hoặc số điện thoại" />

                <DepthCard style={styles.codeCard} plateColor="rgba(27, 61, 110, 0.1)">
                  <Text style={styles.inviteCodeLabel}>Mã mời</Text>
                  <Text style={styles.inviteCode}>{caregiverInviteMock.inviteCode}</Text>
                  <View style={styles.qrBox}>
                    <Ionicons name="qr-code" size={48} color={colors.brandName} />
                    <Text style={styles.qrText}>{caregiverInviteMock.qrLabel}</Text>
                  </View>
                </DepthCard>

                <Text style={styles.permissionTitle}>Quyền truy cập</Text>
                <View style={styles.permissionWrap}>
                  {caregiverPermissionOptions.map((item) => (
                    <DepthChip
                      key={item}
                      label={item}
                      active={permissions.includes(item)}
                      onPress={() => togglePermission(item)}
                    />
                  ))}
                </View>

                <DepthButton
                  label="Gửi lời mời"
                  tone="brand"
                  icon={<Ionicons name="send" size={16} color={colors.onPrimary} />}
                  onPress={() => setShowInvite(false)}
                />
                <DepthPressable depth="sm" onPress={() => setShowInvite(false)}>
                  <Text style={styles.closeText}>Đóng</Text>
                </DepthPressable>
              </LinearGradient>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SubScreen>
  );
}

const styles = StyleSheet.create({
  caregiverCard: {
    padding: spacing.base,
    gap: spacing.sm,
  },
  caregiverTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  caregiverInfo: {
    flex: 1,
    gap: 4,
  },
  caregiverName: {
    ...typography.titleSm,
    fontFamily: fonts.sansSemiBold,
    color: colors.ink,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  caregiverMeta: {
    ...typography.caption,
    fontFamily: fonts.sans,
    color: colors.body,
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  statusLinked: {
    backgroundColor: '#ECFDF3',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  statusPending: {
    backgroundColor: '#FFF8EE',
    borderWidth: 1,
    borderColor: '#F0D9A8',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    ...typography.caption,
    fontFamily: fonts.sansSemiBold,
    fontSize: 11,
  },
  statusTextLinked: {
    color: colors.semanticSuccess,
  },
  statusTextPending: {
    color: colors.accentWarning,
  },
  unlinkBtn: {
    minHeight: 42,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(198, 53, 53, 0.2)',
    backgroundColor: colors.dangerSoft,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  unlinkText: {
    ...typography.button,
    fontFamily: fonts.sansSemiBold,
    color: colors.critical,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(6, 18, 34, 0.55)',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  modalStop: {
    position: 'relative',
  },
  modalPlate: {
    position: 'absolute',
    left: 8,
    right: 8,
    top: 8,
    bottom: -6,
    borderRadius: radius.xl,
    backgroundColor: 'rgba(12, 36, 68, 0.2)',
  },
  modalShell: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.hairlineStrong,
    ...MedsTheme.elevation.float,
  },
  modalCard: {
    padding: spacing.base,
    gap: spacing.sm,
  },
  modalTitle: {
    ...typography.titleMd,
    fontFamily: fonts.sansSemiBold,
    color: colors.ink,
  },
  modalSubtitle: {
    ...typography.caption,
    fontFamily: fonts.sans,
    color: colors.body,
    marginBottom: spacing.xxs,
  },
  codeCard: {
    padding: spacing.sm,
    gap: spacing.xs,
    alignItems: 'center',
  },
  inviteCodeLabel: {
    ...typography.captionUppercase,
    fontFamily: fonts.sansSemiBold,
    color: colors.muted,
    letterSpacing: 0.8,
  },
  inviteCode: {
    ...typography.titleMd,
    fontFamily: fonts.sansSemiBold,
    color: colors.brandName,
    letterSpacing: 1,
  },
  qrBox: {
    width: '100%',
    minHeight: 120,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.hairlineStrong,
    backgroundColor: colors.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.xxs,
  },
  qrText: {
    ...typography.caption,
    fontFamily: fonts.sans,
    color: colors.body,
  },
  permissionTitle: {
    ...typography.titleSm,
    fontFamily: fonts.sansSemiBold,
    color: colors.ink,
  },
  permissionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  closeText: {
    textAlign: 'center',
    ...typography.bodySm,
    fontFamily: fonts.sansSemiBold,
    color: colors.brandName,
    paddingVertical: spacing.xs,
  },
});
