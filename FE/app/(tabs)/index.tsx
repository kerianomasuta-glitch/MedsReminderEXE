import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { MedicationStatus, MedicationItem } from "@/constants/meds-data";
import { MedsTheme } from "@/constants/meds-theme";
import {
  getPrescriptionErrorMessage,
  getPrescriptionsByPatientApi,
  type PrescriptionMedicationRef,
  type PrescriptionSummary,
} from "@/services/prescription-api";
import { useMedicationSchedules } from "@/store/medication-schedule-store";
import { resolveAuthUserId, useAuth } from "@/store/auth-store";

const { colors, typography, radius, spacing, fonts } = MedsTheme;

const statusLabel: Record<MedicationStatus, string> = {
  taken: "Đã uống",
  upcoming: "Sắp tới",
  late: "Trễ giờ",
  missed: "Bỏ qua",
};

function getPopulatedMedications(medications?: PrescriptionSummary['medications']): PrescriptionMedicationRef[] {
  return (medications ?? []).filter(
    (item): item is PrescriptionMedicationRef =>
      typeof item === 'object' && item !== null && Boolean(item.name || item._id),
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const fallbackSchedules = useMedicationSchedules();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [displaySchedules, setDisplaySchedules] = useState<MedicationItem[]>([]);
  const { accessToken, role, user } = useAuth();

  const fetchPrescriptionsAndMap = useCallback(async () => {
    const patientId = resolveAuthUserId(user);
    if (!accessToken || role !== 'patient' || !patientId) {
      setDisplaySchedules(fallbackSchedules);
      setError(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await getPrescriptionsByPatientApi({ patientId, page: 1, limit: 20 }, accessToken);

      if (response.data.prescriptions?.length) {
        const mappedList: MedicationItem[] = response.data.prescriptions.flatMap((pres, index) => {
          const meds = getPopulatedMedications(pres.medications);
          if (!meds.length) return [];

          const hours = ['08:00 AM', '01:00 PM', '06:00 PM', '09:00 PM'];
          const statusOptions: MedicationStatus[] = ['taken', 'upcoming', 'missed', 'late'];

          return meds.map((med, medIndex) => ({
            id: `${pres._id}-${med._id ?? medIndex}-${index}-${medIndex}`,
            name: med.name ?? 'Thuốc',
            dose: `${med.dosage ?? ''}${med.form ? ` - dạng ${med.form}` : ''}`.trim() || 'Chưa có liều lượng',
            time: hours[(index + medIndex) % hours.length],
            icon: med.form === 'syrup' || med.form === 'suspension' ? 'water' as const : 'medical' as const,
            status: statusOptions[(index + medIndex) % statusOptions.length],
            note: pres.note || pres.title,
          }));
        });

        setDisplaySchedules(mappedList.length ? mappedList : fallbackSchedules);
      } else {
        setDisplaySchedules(fallbackSchedules);
      }
    } catch (err: unknown) {
      setError(getPrescriptionErrorMessage(err));
      setDisplaySchedules(fallbackSchedules);
    } finally {
      setLoading(false);
    }
  }, [accessToken, role, user, fallbackSchedules]);

  useFocusEffect(
    useCallback(() => {
      fetchPrescriptionsAndMap();
    }, [fetchPrescriptionsAndMap])
  );

  const upcoming = displaySchedules.find((item) => item.status === "upcoming") ?? displaySchedules[0];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 132 },
          ]}
        >
          <View style={styles.headerRow}>
            <View style={styles.profileRow}>
              <View style={styles.avatar}>
                <Ionicons
                  name="person"
                  size={16}
                  color={colors.ink}
                />
              </View>
              <Text style={styles.userName}>MedsReminder</Text>
            </View>

            <View style={styles.headerActions}>
              <Pressable style={styles.iconButton} onPress={() => router.push('/reminder')}>
                <Ionicons
                  name="notifications-outline"
                  size={20}
                  color={colors.ink}
                />
              </Pressable>
              <Pressable
                style={styles.sosButton}
                onPress={() => router.push("/sos")}
              >
                <Ionicons name="warning" size={13} color="#FFFFFF" />
                <Text style={styles.sosButtonText}>SOS</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Lịch thuốc hôm nay</Text>
            <Text style={styles.sectionDate}>Thứ Sáu, 26 Tháng 6</Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.ink} />
              <Text style={styles.loadingText}>Đang cập nhật lịch uống thuốc...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorBanner}>
              <Ionicons name="warning" size={16} color={colors.critical} />
              <Text style={styles.errorText}>Dữ liệu ngoại tuyến. Có lỗi khi đồng bộ.</Text>
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
                    {upcoming ? "Được nhắc nhở" : "Chưa có lịch"}
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
            <Text style={styles.upcomingDose}>{upcoming?.dose ?? "Hãy thêm lịch uống thuốc mới"}</Text>

            {upcoming && (
              <Pressable
                style={styles.doneButton}
                onPress={() => {
                  setDisplaySchedules(prev =>
                    prev.map((item) => item.id === upcoming.id ? { ...item, status: 'taken' as const } : item)
                  );
                }}>
                <Text style={styles.doneButtonText}>Đã uống</Text>
              </Pressable>
            )}
          </View>

          <View style={styles.dayHeader}>
            <Text style={styles.groupLabel}>TẤT CẢ TRONG NGÀY</Text>
            <Pressable onPress={() => router.push("/schedule")}>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </Pressable>
          </View>

          {displaySchedules.map((item) => (
            <Pressable
              key={item.id}
              onPress={() =>
                router.push({
                  pathname: "/medication/[id]",
                  params: { id: item.id },
                })
              }
              style={[
                styles.medicationCard,
                item.status === "missed" && styles.missedCard,
              ]}
            >
              <View style={styles.medicationLeft}>
                <View style={styles.medicationIcon}>
                  <Ionicons
                    name={
                      item.icon === "water"
                        ? "water"
                        : "medkit"
                    }
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
          ))}
        </ScrollView>

        <Pressable
          style={[styles.addButton, { bottom: insets.bottom + 74 }]}
          onPress={() => router.push("/medicines/new")}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </Pressable>
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xxs + 2,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surfaceStrong,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  userName: {
    ...typography.displayMd,
    fontFamily: fonts.sansSemiBold,
    color: colors.ink,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  sosButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs,
    backgroundColor: colors.critical,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    height: 30,
  },
  sosButtonText: {
    color: colors.onPrimary,
    fontFamily: fonts.sansSemiBold,
    fontSize: 12,
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
  addButton: {
    position: "absolute",
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 6,
  },
  loadingContainer: {
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
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
