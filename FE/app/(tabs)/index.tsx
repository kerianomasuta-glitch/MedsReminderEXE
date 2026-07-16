import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import { ScrollView, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { DepthButton, DepthCard, DepthHero, DepthPressable, GlowOrb, StaggerIn } from "@/components/meds/depth-ui";
import { PatientTabHeader } from "@/components/meds/patient-tab-header";
import { MedicationStatus, MedicationItem } from "@/constants/meds-data";
import { MedsTheme } from "@/constants/meds-theme";
import {
  getScheduleErrorMessage,
  getSchedulesByPatientApi,
  resolvePrescriptionTitle,
  type ScheduleSummary,
} from "@/services/schedule-api";
import { getPatientScheduleNavParams, resolveAuthUserId, useAuth } from "@/store/auth-store";

const { colors, typography, radius, spacing, fonts } = MedsTheme;

const statusLabel: Record<MedicationStatus, string> = {
  taken: "Đã uống",
  upcoming: "Sắp tới",
  late: "Trễ giờ",
  missed: "Bỏ qua",
};

function formatTodayDate() {
  return new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function mapSchedulesToTodayItems(schedules: ScheduleSummary[]): MedicationItem[] {
  const items: MedicationItem[] = [];

  for (const schedule of schedules) {
    if (schedule.isActive === false) continue;

    const title = resolvePrescriptionTitle(schedule.prescriptionId);
    const prescriptionId =
      typeof schedule.prescriptionId === "object"
        ? schedule.prescriptionId?._id
        : schedule.prescriptionId;

    for (const [idx, slot] of (schedule.timeSlots ?? []).entries()) {
      items.push({
        id: `${schedule._id}-${idx}`,
        name: title,
        dose: slot.dosageNote?.trim() || "Theo lịch uống",
        time: slot.time,
        icon: "medical",
        status: "upcoming",
        note: prescriptionId,
      });
    }
  }

  return items.sort((a, b) => a.time.localeCompare(b.time));
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [displaySchedules, setDisplaySchedules] = useState<MedicationItem[]>([]);
  const { accessToken, role, user } = useAuth();

  const openNewSchedule = useCallback(() => {
    router.push({ pathname: "/medicines/new", params: getPatientScheduleNavParams(user) });
  }, [user]);

  const fetchTodaySchedules = useCallback(async () => {
    const patientId = resolveAuthUserId(user);
    if (!accessToken || role !== "patient" || !patientId) {
      setDisplaySchedules([]);
      setError(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await getSchedulesByPatientApi(patientId, accessToken, { page: 1, limit: 50 });
      setDisplaySchedules(mapSchedulesToTodayItems(response.data.schedules ?? []));
    } catch (err: unknown) {
      setError(getScheduleErrorMessage(err));
      setDisplaySchedules([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken, role, user]);

  useFocusEffect(
    useCallback(() => {
      void fetchTodaySchedules();
    }, [fetchTodaySchedules])
  );

  const upcoming = displaySchedules.find((item) => item.status === "upcoming") ?? displaySchedules[0];
  const hasSchedules = displaySchedules.length > 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 96 },
          ]}
        >
          <PatientTabHeader />

          <Animated.View entering={FadeInDown.delay(80).duration(450).springify()} style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Lịch thuốc hôm nay</Text>
            <View style={styles.datePill}>
              <View style={styles.datePillShine} pointerEvents="none" />
              <Ionicons name="calendar-outline" size={14} color={colors.brandName} />
              <Text style={styles.sectionDate}>{formatTodayDate()}</Text>
            </View>
          </Animated.View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.ink} />
              <Text style={styles.loadingText}>Đang cập nhật lịch uống thuốc...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorBanner}>
              <Ionicons name="warning" size={16} color={colors.critical} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Text style={styles.groupLabel}>SẮP TỚI</Text>
          <DepthHero>
            <GlowOrb size={150} color="rgba(255,255,255,0.16)" style={styles.upcomingGlow} />
            <GlowOrb size={80} color="rgba(126,232,168,0.2)" style={styles.upcomingGlowSmall} />
            <View style={styles.upcomingHeader}>
              <View>
                <Text style={styles.upcomingTime}>
                  {upcoming?.time ?? "--:--"}
                </Text>
                <View style={styles.upcomingBadge}>
                  <View style={styles.upcomingBadgeDot} />
                  <Text style={styles.upcomingBadgeText}>
                    {upcoming ? "Sắp uống" : "Chưa có lịch"}
                  </Text>
                </View>
              </View>

              <View style={styles.pillIconWrap}>
                <Ionicons
                  name="medical"
                  size={22}
                  color={colors.onPrimary}
                />
              </View>
            </View>

            <Text style={styles.upcomingName} numberOfLines={2}>
              {upcoming?.name ?? "Chưa có thuốc"}
            </Text>
            <Text style={styles.upcomingDose} numberOfLines={2}>
              {upcoming?.dose ?? "Hãy thêm lịch uống thuốc mới"}
            </Text>

            {upcoming ? (
              <DepthButton
                label="Đã uống"
                icon={<Ionicons name="checkmark-circle" size={18} color={colors.brandName} />}
                onPress={() => {
                  setDisplaySchedules((prev) =>
                    prev.map((item) =>
                      item.id === upcoming.id ? { ...item, status: "taken" as const } : item
                    )
                  );
                }}
              />
            ) : (
              <DepthButton
                label="Thêm lịch uống"
                icon={<Ionicons name="add-circle-outline" size={18} color={colors.brandName} />}
                onPress={openNewSchedule}
              />
            )}
          </DepthHero>

          <View style={styles.dayHeader}>
            <Text style={styles.groupLabel}>TẤT CẢ TRONG NGÀY</Text>
            <DepthPressable depth="sm" onPress={() => router.push("/schedule")}>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </DepthPressable>
          </View>

          {!loading && !hasSchedules ? (
            <DepthCard style={styles.emptyCard}>
              <Ionicons name="calendar-outline" size={32} color={colors.muted} />
              <Text style={styles.emptyTitle}>Chưa có lịch uống thuốc</Text>
              <Text style={styles.emptyText}>Thêm lịch mới để được nhắc uống thuốc đúng giờ.</Text>
              <DepthButton label="Thêm lịch uống thuốc" tone="brand" onPress={openNewSchedule} />
            </DepthCard>
          ) : (
            displaySchedules.map((item, index) => (
              <StaggerIn key={item.id} index={index}>
                <DepthCard
                  style={[
                    styles.medicationCard,
                    item.status === "missed" && styles.missedCard,
                  ]}
                  plateColor={
                    item.status === "missed"
                      ? "rgba(198, 53, 53, 0.18)"
                      : "rgba(27, 61, 110, 0.12)"
                  }
                  onPress={() => {
                    if (item.note) {
                      router.push({
                        pathname: "/medication/[id]",
                        params: { id: item.note },
                      });
                    }
                  }}
                  depth="sm">
                  <View
                    style={[
                      styles.statusAccent,
                      item.status === "taken" && styles.statusAccentTaken,
                      item.status === "upcoming" && styles.statusAccentUpcoming,
                      item.status === "late" && styles.statusAccentLate,
                      item.status === "missed" && styles.statusAccentMissed,
                    ]}
                  />
                  <View style={styles.medicationLeft}>
                    <View style={styles.medicationIcon}>
                      <Ionicons
                        name={item.icon === "water" ? "water" : "medkit"}
                        size={16}
                        color={colors.brandName}
                      />
                    </View>
                    <View style={styles.medicationInfo}>
                      <Text style={styles.medicationName} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.medicationDose} numberOfLines={1}>{item.dose}</Text>
                    </View>
                  </View>

                  <View style={styles.medicationRight}>
                    <Text style={styles.medicationTime}>{item.time}</Text>
                    <View
                      style={[
                        styles.statusPill,
                        item.status === "taken" && styles.statusPillTaken,
                        item.status === "upcoming" && styles.statusPillUpcoming,
                        item.status === "late" && styles.statusPillLate,
                        item.status === "missed" && styles.statusPillMissed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          item.status === "taken" && styles.statusTaken,
                          item.status === "upcoming" && styles.statusUpcoming,
                          item.status === "late" && styles.statusLate,
                          item.status === "missed" && styles.statusMissed,
                        ]}
                      >
                        {statusLabel[item.status]}
                      </Text>
                    </View>
                  </View>
                </DepthCard>
              </StaggerIn>
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.canvasSoft,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  sectionHeader: {
    marginBottom: spacing.xxs,
    gap: spacing.xs,
  },
  sectionTitle: {
    ...typography.displayMd,
    fontFamily: fonts.sansSemiBold,
    color: colors.ink,
    letterSpacing: -0.5,
  },
  datePill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.brandNameSoft,
    borderWidth: 1,
    borderTopColor: "rgba(255,255,255,0.9)",
    borderColor: "rgba(27, 61, 110, 0.12)",
    overflow: "hidden",
    ...MedsTheme.elevation.float,
  },
  datePillShine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: "rgba(255,255,255,0.45)",
  },
  sectionDate: {
    ...typography.bodySm,
    fontFamily: fonts.sansMedium,
    color: colors.brandName,
    textTransform: "capitalize",
  },
  groupLabel: {
    ...typography.captionUppercase,
    fontFamily: fonts.sansSemiBold,
    color: colors.muted,
    letterSpacing: 1,
  },
  upcomingGlow: {
    top: -40,
    right: -24,
  },
  upcomingGlowSmall: {
    bottom: 20,
    left: -20,
  },
  upcomingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  upcomingTime: {
    fontSize: 40,
    lineHeight: 44,
    fontFamily: fonts.sansSemiBold,
    color: colors.onPrimary,
    letterSpacing: -1,
  },
  upcomingBadge: {
    alignSelf: "flex-start",
    marginTop: spacing.xs - 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  upcomingBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#7EE8A8",
  },
  upcomingBadgeText: {
    color: colors.onPrimary,
    ...typography.caption,
    fontFamily: fonts.sansMedium,
  },
  pillIconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderTopColor: "rgba(255,255,255,0.4)",
    borderColor: "rgba(255,255,255,0.22)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  upcomingName: {
    marginTop: spacing.sm,
    ...typography.displayMd,
    fontFamily: fonts.sansSemiBold,
    color: colors.onPrimary,
    letterSpacing: -0.3,
  },
  upcomingDose: {
    marginTop: spacing.xxs,
    ...typography.bodySm,
    fontFamily: fonts.sans,
    color: "rgba(255,255,255,0.82)",
  },
  seeAll: {
    color: colors.textLink,
    ...typography.bodySm,
    fontFamily: fonts.sansSemiBold,
  },
  emptyCard: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.base,
    gap: spacing.xs,
  },
  emptyTitle: {
    ...typography.titleSm,
    fontFamily: fonts.sansSemiBold,
    color: colors.ink,
  },
  emptyText: {
    ...typography.bodySm,
    fontFamily: fonts.sans,
    color: colors.body,
    textAlign: "center",
  },
  dayHeader: {
    marginTop: spacing.xs,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  medicationCard: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm + 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    overflow: "hidden",
  },
  missedCard: {
    borderColor: colors.semanticError,
    backgroundColor: "#FFFBFB",
  },
  statusAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: colors.hairlineStrong,
  },
  statusAccentTaken: {
    backgroundColor: colors.semanticSuccess,
  },
  statusAccentUpcoming: {
    backgroundColor: colors.brandName,
  },
  statusAccentLate: {
    backgroundColor: colors.accentWarning,
  },
  statusAccentMissed: {
    backgroundColor: colors.critical,
  },
  medicationLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    paddingRight: spacing.xs,
    paddingLeft: 4,
  },
  medicationIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.brandNameSoft,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderTopColor: "rgba(255,255,255,0.9)",
    borderColor: "rgba(27, 61, 110, 0.1)",
    shadowColor: colors.brandName,
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    ...typography.titleSm,
    fontFamily: fonts.sansSemiBold,
    color: colors.ink,
  },
  medicationDose: {
    marginTop: 2,
    ...typography.caption,
    fontFamily: fonts.sans,
    color: colors.body,
  },
  medicationRight: {
    alignItems: "flex-end",
    gap: 6,
  },
  medicationTime: {
    ...typography.bodySm,
    fontFamily: fonts.sansSemiBold,
    color: colors.ink,
  },
  statusPill: {
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: colors.surfaceStrong,
  },
  statusPillTaken: {
    backgroundColor: "#ECFDF3",
  },
  statusPillUpcoming: {
    backgroundColor: colors.brandNameSoft,
  },
  statusPillLate: {
    backgroundColor: "#FFF8EE",
  },
  statusPillMissed: {
    backgroundColor: colors.dangerSoft,
  },
  statusText: {
    ...typography.caption,
    fontFamily: fonts.sansSemiBold,
    fontSize: 11,
  },
  statusTaken: {
    color: colors.semanticSuccess,
  },
  statusUpcoming: {
    color: colors.brandName,
  },
  statusLate: {
    color: colors.accentWarning,
  },
  statusMissed: {
    color: colors.critical,
  },
  loadingContainer: {
    paddingVertical: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  loadingText: {
    color: colors.body,
    ...typography.bodySm,
    fontFamily: fonts.sansMedium,
  },
  errorBanner: {
    paddingVertical: 10,
    paddingHorizontal: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.semanticError,
  },
  errorText: {
    color: colors.critical,
    ...typography.caption,
    fontFamily: fonts.sansMedium,
    flex: 1,
  },
});
