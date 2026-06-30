import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

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

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Lịch thuốc hôm nay</Text>
            <Text style={styles.sectionDate}>{formatTodayDate()}</Text>
          </View>

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
          <View style={styles.upcomingCard}>
            <View style={styles.upcomingHeader}>
              <View>
                <Text style={styles.upcomingTime}>
                  {upcoming?.time ?? "--:--"}
                </Text>
                <View style={styles.upcomingBadge}>
                  <Text style={styles.upcomingBadgeText}>
                    {upcoming ? "Sắp uống" : "Chưa có lịch"}
                  </Text>
                </View>
              </View>

              <View style={styles.pillIconWrap}>
                <Ionicons
                  name="medical"
                  size={20}
                  color={colors.onDarkSoft}
                />
              </View>
            </View>

            <Text style={styles.upcomingName}>{upcoming?.name ?? "Chưa có thuốc"}</Text>
            <Text style={styles.upcomingDose}>
              {upcoming?.dose ?? "Hãy thêm lịch uống thuốc mới"}
            </Text>

            {upcoming ? (
              <Pressable
                style={styles.doneButton}
                onPress={() => {
                  setDisplaySchedules((prev) =>
                    prev.map((item) =>
                      item.id === upcoming.id ? { ...item, status: "taken" as const } : item
                    )
                  );
                }}>
                <Text style={styles.doneButtonText}>Đã uống</Text>
              </Pressable>
            ) : null}
          </View>

          <View style={styles.dayHeader}>
            <Text style={styles.groupLabel}>TẤT CẢ TRONG NGÀY</Text>
            <Pressable onPress={() => router.push("/schedule")}>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </Pressable>
          </View>

          {!loading && !hasSchedules ? (
            <View style={styles.emptyCard}>
              <Ionicons name="calendar-outline" size={32} color={colors.muted} />
              <Text style={styles.emptyTitle}>Chưa có lịch uống thuốc</Text>
              <Text style={styles.emptyText}>Thêm lịch mới để được nhắc uống thuốc đúng giờ.</Text>
              <Pressable style={styles.emptyButton} onPress={openNewSchedule}>
                <Text style={styles.emptyButtonText}>Thêm lịch uống thuốc</Text>
              </Pressable>
            </View>
          ) : (
            displaySchedules.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => {
                  if (item.note) {
                    router.push({
                      pathname: "/medication/[id]",
                      params: { id: item.note },
                    });
                  }
                }}
                style={[
                  styles.medicationCard,
                  item.status === "missed" && styles.missedCard,
                ]}
              >
                <View style={styles.medicationLeft}>
                  <View style={styles.medicationIcon}>
                    <Ionicons
                      name={item.icon === "water" ? "water" : "medkit"}
                      size={15}
                      color={colors.ink}
                    />
                  </View>
                  <View style={styles.medicationInfo}>
                    <Text style={styles.medicationName}>{item.name}</Text>
                    <Text style={styles.medicationDose}>{item.dose}</Text>
                  </View>
                </View>

                <View style={styles.medicationRight}>
                  <Text style={styles.medicationTime}>{item.time}</Text>
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
              </Pressable>
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
    backgroundColor: colors.canvas,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.sm + 2,
  },
  sectionHeader: {
    marginBottom: spacing.xxs,
  },
  sectionTitle: {
    ...typography.displayLg,
    fontFamily: fonts.sansSemiBold,
    color: colors.ink,
  },
  sectionDate: {
    marginTop: spacing.xxs,
    ...typography.bodySm,
    fontFamily: fonts.sans,
    color: colors.body,
  },
  groupLabel: {
    ...typography.captionUppercase,
    fontFamily: fonts.sansSemiBold,
    color: colors.muted,
  },
  upcomingCard: {
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceDark,
    padding: spacing.base,
    ...MedsTheme.elevation.card,
  },
  upcomingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  upcomingTime: {
    fontSize: 36,
    fontFamily: fonts.sansSemiBold,
    fontWeight: "600",
    color: colors.onDark,
  },
  upcomingBadge: {
    alignSelf: "flex-start",
    marginTop: spacing.xs - 2,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceDarkElevated,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  upcomingBadgeText: {
    color: colors.onDarkSoft,
    ...typography.bodySm,
    fontFamily: fonts.sansMedium,
  },
  pillIconWrap: {
    width: 68,
    height: 60,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceDarkElevated,
    justifyContent: "center",
    alignItems: "center",
  },
  upcomingName: {
    marginTop: spacing.sm + 2,
    fontSize: 28,
    fontFamily: fonts.sansSemiBold,
    color: colors.onDark,
  },
  upcomingDose: {
    marginTop: spacing.xxs,
    ...typography.bodySm,
    fontFamily: fonts.sans,
    color: colors.onDarkSoft,
  },
  doneButton: {
    marginTop: spacing.base,
    backgroundColor: colors.onPrimary,
    borderRadius: radius.md,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  doneButtonText: {
    color: colors.ink,
    fontFamily: fonts.sansMedium,
    ...typography.button,
  },
  dayHeader: {
    marginTop: spacing.xxs,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  seeAll: {
    color: colors.textLink,
    ...typography.bodySm,
    fontFamily: fonts.sansMedium,
  },
  emptyCard: {
    alignItems: "center",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.base,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.hairlineStrong,
    backgroundColor: colors.surfaceCard,
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
  emptyButton: {
    marginTop: spacing.xxs,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  emptyButtonText: {
    ...typography.button,
    fontFamily: fonts.sansMedium,
    color: colors.onPrimary,
  },
  medicationCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.hairlineStrong,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    ...MedsTheme.elevation.card,
  },
  missedCard: {
    borderColor: colors.semanticError,
    backgroundColor: "#FFF9F9",
  },
  medicationLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    paddingRight: spacing.xs,
  },
  medicationIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceStrong,
    justifyContent: "center",
    alignItems: "center",
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
    marginTop: spacing.xxs,
    ...typography.caption,
    fontFamily: fonts.sans,
    color: colors.body,
  },
  medicationRight: {
    alignItems: "flex-end",
    gap: spacing.xs - 2,
  },
  medicationTime: {
    ...typography.bodySm,
    fontFamily: fonts.sansSemiBold,
    color: colors.ink,
  },
  statusText: {
    ...typography.caption,
    fontFamily: fonts.sansSemiBold,
  },
  statusTaken: {
    color: colors.semanticSuccess,
  },
  statusUpcoming: {
    color: colors.ink,
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
    backgroundColor: colors.surfaceStrong,
    borderRadius: radius.md,
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
    borderRadius: radius.md,
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
