import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DepthButton, DepthCard, DepthHero, DepthPressable, GlowOrb, StaggerIn } from '@/components/meds/depth-ui';
import { FeedbackToast } from '@/components/meds/feedback-toast';
import { reminderSkipReasons } from '@/constants/app-mock';
import { MedsTheme } from '@/constants/meds-theme';
import {
  buildTodayDoseItems,
  formatSlotTimeDisplay,
  getNearestDoseFromSchedules,
  getScheduleErrorMessage,
  getSchedulesByPatientApi,
  parseSlotTimeMinutes,
  type NearestDoseItem,
  type TodayDoseItem,
} from '@/services/schedule-api';
import { getPatientScheduleNavParams, resolveAuthUserId, useAuth } from '@/store/auth-store';

const { colors, typography, radius, spacing, fonts } = MedsTheme;

const STATUS_LABEL: Record<NearestDoseItem['status'], string> = {
  upcoming: 'Sắp uống',
  late: 'Trễ giờ',
};

function formatTodayDate() {
  return new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function DoseTimelineRow({
  item,
  active,
  onPress,
}: {
  item: TodayDoseItem;
  active: boolean;
  onPress?: () => void;
}) {
  return (
    <DepthPressable depth="sm" onPress={onPress} style={styles.timelinePressable}>
      <View style={[styles.timelineRow, active && styles.timelineRowActive]}>
        <Text style={[styles.timelineTime, active && styles.timelineTimeActive]}>
          {formatSlotTimeDisplay(item.time)}
        </Text>
        <View style={styles.timelineInfo}>
          <Text style={[styles.timelineName, active && styles.timelineNameActive]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.timelineDose} numberOfLines={1}>
            {item.dose}
          </Text>
        </View>
        {active ? (
          <View style={styles.timelineBadge}>
            <Text style={styles.timelineBadgeText}>Tiếp theo</Text>
          </View>
        ) : (
          <Ionicons name="ellipse-outline" size={14} color={colors.muted} />
        )}
      </View>
    </DepthPressable>
  );
}

export default function ReminderScreen() {
  const { accessToken, role, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [todayItems, setTodayItems] = useState<TodayDoseItem[]>([]);
  const [nearestDose, setNearestDose] = useState<NearestDoseItem | null>(null);
  const [selectedDoseId, setSelectedDoseId] = useState<string | null>(null);
  const [toastText, setToastText] = useState<string | null>(null);
  const [showSkipModal, setShowSkipModal] = useState(false);

  const fetchSchedules = useCallback(async () => {
    const patientId = resolveAuthUserId(user);
    if (!accessToken || role !== 'patient' || !patientId) {
      setTodayItems([]);
      setNearestDose(null);
      setError(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await getSchedulesByPatientApi(patientId, accessToken, { page: 1, limit: 50 });
      const schedules = response.data.schedules ?? [];
      const items = buildTodayDoseItems(schedules);
      const nearest = getNearestDoseFromSchedules(schedules);
      setTodayItems(items);
      setNearestDose(nearest);
      setSelectedDoseId((prev) => {
        if (prev && items.some((item) => item.id === prev)) return prev;
        return nearest?.id ?? items[0]?.id ?? null;
      });
    } catch (err: unknown) {
      setError(getScheduleErrorMessage(err));
      setTodayItems([]);
      setNearestDose(null);
    } finally {
      setLoading(false);
    }
  }, [accessToken, role, user]);

  useFocusEffect(
    useCallback(() => {
      void fetchSchedules();
    }, [fetchSchedules]),
  );

  const activeDose = useMemo(() => {
    if (!todayItems.length) return null;
    const picked = todayItems.find((item) => item.id === selectedDoseId);
    if (picked) {
      const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
      const isLate = parseSlotTimeMinutes(picked.time) < nowMinutes;
      return {
        ...picked,
        status: (isLate ? 'late' : 'upcoming') as NearestDoseItem['status'],
      };
    }
    return nearestDose;
  }, [todayItems, selectedDoseId, nearestDose]);

  const otherTodayItems = useMemo(
    () => todayItems.filter((item) => item.id !== activeDose?.id),
    [todayItems, activeDose?.id],
  );

  const openNewSchedule = useCallback(() => {
    router.push({ pathname: '/medicines/new', params: getPatientScheduleNavParams(user) });
  }, [user]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Nhắc uống thuốc',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.canvasSoft },
        }}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(420).springify()} style={styles.pageIntro}>
          <Text style={styles.pageTitle}>Đến giờ uống thuốc</Text>
          <Text style={styles.pageDate}>{formatTodayDate()}</Text>
        </Animated.View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={colors.brandName} />
            <Text style={styles.loadingText}>Đang tải lịch uống hôm nay...</Text>
          </View>
        ) : error ? (
          <DepthCard style={styles.stateCard}>
            <Ionicons name="alert-circle-outline" size={28} color={colors.critical} />
            <Text style={styles.stateTitle}>Không tải được lịch</Text>
            <Text style={styles.stateText}>{error}</Text>
            <DepthButton label="Thử lại" tone="brand" onPress={() => void fetchSchedules()} />
          </DepthCard>
        ) : !activeDose ? (
          <DepthCard style={styles.stateCard}>
            <Ionicons name="calendar-outline" size={32} color={colors.muted} />
            <Text style={styles.stateTitle}>Chưa có lịch uống hôm nay</Text>
            <Text style={styles.stateText}>Thêm lịch uống thuốc để được nhắc đúng giờ.</Text>
            <DepthButton label="Thêm lịch uống thuốc" tone="brand" onPress={openNewSchedule} />
          </DepthCard>
        ) : (
          <>
            <DepthHero>
              <GlowOrb size={120} color="rgba(255,255,255,0.15)" style={styles.heroGlow} />
              <View style={styles.heroBadge}>
                <View style={styles.heroBadgeDot} />
                <Text style={styles.heroBadgeText}>{STATUS_LABEL[activeDose.status]}</Text>
              </View>

              <Text style={styles.heroTime}>{formatSlotTimeDisplay(activeDose.time)}</Text>

              <View style={styles.heroIconWrap}>
                <Ionicons name="medkit" size={34} color={colors.onPrimary} />
              </View>

              <Text style={styles.heroName}>{activeDose.name}</Text>
              <Text style={styles.heroDose}>{activeDose.dose}</Text>

              {activeDose.reminderMinutesBefore !== undefined ? (
                <View style={styles.reminderHint}>
                  <Ionicons name="notifications-outline" size={14} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.reminderHintText}>
                    Nhắc trước {activeDose.reminderMinutesBefore} phút
                  </Text>
                </View>
              ) : null}
            </DepthHero>

            <View style={styles.actionGroup}>
              <DepthButton
                label="Đã uống"
                icon={<Ionicons name="checkmark-circle" size={18} color={colors.brandName} />}
                onPress={() => setToastText('Đã xác nhận uống thuốc')}
              />
              <DepthButton
                label="Nhắc lại sau 15 phút"
                tone="brand"
                icon={<Ionicons name="time-outline" size={18} color={colors.onPrimary} />}
                onPress={() => setToastText('Đã đặt nhắc lại sau 15 phút')}
              />
              <DepthPressable depth="sm" onPress={() => setShowSkipModal(true)}>
                <View style={styles.skipButton}>
                  <Ionicons name="close-circle-outline" size={18} color={colors.critical} />
                  <Text style={styles.skipButtonText}>Bỏ qua</Text>
                </View>
              </DepthPressable>
            </View>

            {otherTodayItems.length > 0 ? (
              <>
                <Text style={styles.sectionLabel}>CÁC MỐC KHÁC HÔM NAY</Text>
                <DepthCard style={styles.timelineCard}>
                  {otherTodayItems.map((item, index) => (
                    <StaggerIn key={item.id} index={index}>
                      <DoseTimelineRow
                        item={item}
                        active={false}
                        onPress={() => setSelectedDoseId(item.id)}
                      />
                    </StaggerIn>
                  ))}
                </DepthCard>
              </>
            ) : null}
          </>
        )}
      </ScrollView>

      <FeedbackToast message={toastText} onHide={() => setToastText(null)} />

      <Modal transparent animationType="fade" visible={showSkipModal} onRequestClose={() => setShowSkipModal(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowSkipModal(false)}>
          <Pressable style={styles.modalPressStop} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalPlate} />
            <View style={styles.modalCard}>
              <LinearGradient
                colors={['#FFFFFF', colors.canvasSoft]}
                style={styles.modalGradient}>
                <Text style={styles.modalTitle}>Lý do bỏ qua</Text>
                <Text style={styles.modalSubtitle}>Tuỳ chọn — giúp theo dõi chính xác hơn</Text>
                {reminderSkipReasons.map((reason, index) => (
                  <StaggerIn key={reason} index={index}>
                    <DepthPressable
                      depth="sm"
                      onPress={() => {
                        setShowSkipModal(false);
                        setToastText(`Đã ghi nhận: ${reason}`);
                      }}>
                      <View style={styles.reasonRow}>
                        <Text style={styles.reasonText}>{reason}</Text>
                        <Ionicons name="chevron-forward" size={16} color={colors.muted} />
                      </View>
                    </DepthPressable>
                  </StaggerIn>
                ))}
                <DepthPressable depth="sm" onPress={() => setShowSkipModal(false)}>
                  <Text style={styles.modalClose}>Đóng</Text>
                </DepthPressable>
              </LinearGradient>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.canvasSoft,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  pageIntro: {
    gap: spacing.xxs,
    marginBottom: spacing.xxs,
  },
  pageTitle: {
    ...typography.displayMd,
    fontFamily: fonts.sansSemiBold,
    color: colors.ink,
    letterSpacing: -0.5,
  },
  pageDate: {
    ...typography.bodySm,
    fontFamily: fonts.sans,
    color: colors.body,
    textTransform: 'capitalize',
  },
  loadingBox: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
    gap: spacing.xs,
  },
  loadingText: {
    ...typography.bodySm,
    fontFamily: fonts.sansMedium,
    color: colors.body,
  },
  stateCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.base,
    gap: spacing.xs,
  },
  stateTitle: {
    ...typography.titleSm,
    fontFamily: fonts.sansSemiBold,
    color: colors.ink,
    textAlign: 'center',
  },
  stateText: {
    ...typography.bodySm,
    fontFamily: fonts.sans,
    color: colors.body,
    textAlign: 'center',
    marginBottom: spacing.xxs,
  },
  heroGlow: {
    top: -30,
    right: -20,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginBottom: spacing.xs,
  },
  heroBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#7EE8A8',
  },
  heroBadgeText: {
    ...typography.caption,
    fontFamily: fonts.sansSemiBold,
    color: colors.onPrimary,
  },
  heroTime: {
    fontSize: 48,
    lineHeight: 52,
    fontFamily: fonts.sansSemiBold,
    color: colors.onPrimary,
    letterSpacing: -1.2,
    marginBottom: spacing.sm,
  },
  heroIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  heroName: {
    ...typography.displayMd,
    fontFamily: fonts.sansSemiBold,
    color: colors.onPrimary,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  heroDose: {
    marginTop: spacing.xxs,
    ...typography.bodySm,
    fontFamily: fonts.sans,
    color: 'rgba(255,255,255,0.86)',
    textAlign: 'center',
  },
  reminderHint: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  reminderHintText: {
    ...typography.caption,
    fontFamily: fonts.sansMedium,
    color: 'rgba(255,255,255,0.9)',
  },
  actionGroup: {
    gap: spacing.xs,
    marginTop: spacing.xxs,
  },
  skipButton: {
    minHeight: 48,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(198, 53, 53, 0.22)',
    backgroundColor: colors.dangerSoft,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  skipButtonText: {
    ...typography.button,
    fontFamily: fonts.sansSemiBold,
    color: colors.critical,
    fontSize: 15,
  },
  sectionLabel: {
    ...typography.captionUppercase,
    fontFamily: fonts.sansSemiBold,
    color: colors.muted,
    letterSpacing: 1,
    marginTop: spacing.xs,
  },
  timelineCard: {
    paddingVertical: spacing.xxs,
    paddingHorizontal: spacing.xxs,
    gap: 0,
  },
  timelinePressable: {
    width: '100%',
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  timelineRowActive: {
    backgroundColor: colors.brandNameSoft,
  },
  timelineTime: {
    width: 52,
    ...typography.bodySm,
    fontFamily: fonts.sansSemiBold,
    color: colors.ink,
  },
  timelineTimeActive: {
    color: colors.brandName,
  },
  timelineInfo: {
    flex: 1,
    gap: 2,
  },
  timelineName: {
    ...typography.titleSm,
    fontFamily: fonts.sansSemiBold,
    color: colors.ink,
  },
  timelineNameActive: {
    color: colors.brandName,
  },
  timelineDose: {
    ...typography.caption,
    fontFamily: fonts.sans,
    color: colors.body,
  },
  timelineBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.brandNameSoft,
  },
  timelineBadgeText: {
    ...typography.caption,
    fontFamily: fonts.sansSemiBold,
    color: colors.brandName,
    fontSize: 11,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(6, 18, 34, 0.55)',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  modalPressStop: {
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
  modalCard: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.hairlineStrong,
    ...MedsTheme.elevation.float,
  },
  modalGradient: {
    padding: spacing.base,
    gap: spacing.xs,
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
  reasonRow: {
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.hairlineStrong,
    backgroundColor: colors.surfaceCard,
    paddingHorizontal: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reasonText: {
    ...typography.bodySm,
    fontFamily: fonts.sansMedium,
    color: colors.ink,
  },
  modalClose: {
    marginTop: spacing.xs,
    textAlign: 'center',
    ...typography.bodySm,
    fontFamily: fonts.sansSemiBold,
    color: colors.brandName,
    paddingVertical: spacing.xs,
  },
});
