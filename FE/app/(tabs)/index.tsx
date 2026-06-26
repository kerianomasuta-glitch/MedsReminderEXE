import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import axios from "axios";

import { MedicationStatus, MedicationItem } from "@/constants/meds-data";
import { MedsTheme } from "@/constants/meds-theme";
import { updateMedicationScheduleStatus, useMedicationSchedules } from "@/store/medication-schedule-store";
import { useAuth } from "@/store/auth-store";

const statusLabel: Record<MedicationStatus, string> = {
  taken: "Đã uống",
  upcoming: "Sắp tới",
  late: "Trễ giờ",
  missed: "Bỏ qua",
};

interface ApiMedication {
  _id: string;
  name: string;
  dosage: string;
  form?: string;
  unit?: string;
}

interface ApiPrescription {
  _id: string;
  title: string;
  doctorName?: string;
  startDate?: string;
  endDate?: string;
  note?: string;
  medications: ApiMedication[];
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const fallbackSchedules = useMedicationSchedules();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [displaySchedules, setDisplaySchedules] = useState<MedicationItem[]>([]);
  const { accessToken, role } = useAuth();

  const fetchPrescriptionsAndMap = useCallback(async () => {
    if (!accessToken) {
      setDisplaySchedules(fallbackSchedules);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const url = 'http://localhost:3000/api/v1/prescriptions/patient/6a3cef8fd789d8d7be4b7e47?page=1&limit=20';

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.data && response.data.data && response.data.data.prescriptions && response.data.data.prescriptions.length > 0) {
        // Map the api prescriptions data to MedicationItem format
        const mappedList: MedicationItem[] = response.data.data.prescriptions.flatMap((pres: ApiPrescription, index: number) => {
          return pres.medications.map((med: ApiMedication, medIndex: number) => {
            const hours = ['08:00 AM', '01:00 PM', '06:00 PM', '09:00 PM'];
            const statusOptions: MedicationStatus[] = ['taken', 'upcoming', 'missed', 'late'];
            
            return {
              id: `${pres._id}-${med._id}-${index}-${medIndex}`,
              name: med.name,
              dose: `${med.dosage}${med.form ? ` - dạng ${med.form}` : ''}`,
              time: hours[(index + medIndex) % hours.length],
              icon: med.form === 'syrup' || med.form === 'suspension' ? 'water' as const : 'medical' as const,
              status: statusOptions[(index + medIndex) % statusOptions.length],
              note: pres.note || pres.title,
            };
          });
        });

        setDisplaySchedules(mappedList);
      } else {
        setDisplaySchedules(fallbackSchedules);
      }
    } catch (err: any) {
      console.error('Error fetching prescriptions in Home:', err);
      setError(err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi tải đơn thuốc');
      setDisplaySchedules(fallbackSchedules);
    } finally {
      setLoading(false);
    }
  }, [accessToken, role, fallbackSchedules]);

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
                  color={MedsTheme.colors.primaryDark}
                />
              </View>
              <Text style={styles.userName}>MedsReminder</Text>
            </View>

            <View style={styles.headerActions}>
              <Pressable style={styles.iconButton} onPress={() => router.push('/reminder')}>
                <Ionicons
                  name="notifications-outline"
                  size={20}
                  color={MedsTheme.colors.primaryDark}
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
              <ActivityIndicator size="small" color={MedsTheme.colors.primary} />
              <Text style={styles.loadingText}>Đang cập nhật lịch uống thuốc...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorBanner}>
              <Ionicons name="warning" size={16} color={MedsTheme.colors.danger} />
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
                  color={MedsTheme.colors.primarySoft}
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
                    color={MedsTheme.colors.primaryDark}
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
    backgroundColor: MedsTheme.colors.appBackground,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 14,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
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
    backgroundColor: "#D8EDF8",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#C2DBED",
  },
  userName: {
    fontSize: 21,
    fontWeight: "700",
    color: MedsTheme.colors.textMain,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
  },
  sosButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#D72638",
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 30,
  },
  sosButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 12,
  },
  sectionHeader: {
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: MedsTheme.colors.textMain,
  },
  sectionDate: {
    marginTop: 2,
    fontSize: 15,
    color: MedsTheme.colors.textMuted,
  },
  groupLabel: {
    fontSize: 14,
    color: MedsTheme.colors.textMuted,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  upcomingCard: {
    borderRadius: MedsTheme.radius.lg,
    backgroundColor: "#072C62",
    padding: 16,
    shadowColor: "#001126",
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  upcomingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  upcomingTime: {
    fontSize: 36,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  upcomingBadge: {
    alignSelf: "flex-start",
    marginTop: 6,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.16)",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  upcomingBadgeText: {
    color: "#D3E7FF",
    fontSize: 14,
    fontWeight: "600",
  },
  pillIconWrap: {
    width: 68,
    height: 60,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  upcomingName: {
    marginTop: 14,
    fontSize: 29,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  upcomingDose: {
    marginTop: 4,
    fontSize: 15,
    color: "#D8E8FF",
  },
  doneButton: {
    marginTop: 16,
    backgroundColor: "#3696FF",
    borderRadius: 10,
    height: 42,
    justifyContent: "center",
    alignItems: "center",
  },
  doneButtonText: {
    color: "#062C59",
    fontWeight: "700",
    fontSize: 16,
  },
  dayHeader: {
    marginTop: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  seeAll: {
    color: MedsTheme.colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  medicationCard: {
    backgroundColor: MedsTheme.colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: MedsTheme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  missedCard: {
    borderColor: "#F7BCC0",
    backgroundColor: "#FFF3F4",
  },
  medicationLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    paddingRight: 8,
  },
  medicationIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#E8F2FF",
    justifyContent: "center",
    alignItems: "center",
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 16,
    color: MedsTheme.colors.textMain,
    fontWeight: "600",
  },
  medicationDose: {
    marginTop: 2,
    fontSize: 13,
    color: MedsTheme.colors.textMuted,
  },
  medicationRight: {
    alignItems: "flex-end",
    gap: 6,
  },
  medicationTime: {
    fontSize: 14,
    color: MedsTheme.colors.textMain,
    fontWeight: "600",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  statusTaken: {
    color: MedsTheme.colors.success,
  },
  statusUpcoming: {
    color: MedsTheme.colors.primaryDark,
  },
  statusLate: {
    color: MedsTheme.colors.warning,
  },
  statusMissed: {
    color: MedsTheme.colors.danger,
  },
  addButton: {
    position: "absolute",
    right: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#0A0A0A",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.24,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 8,
  },
  loadingContainer: {
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(31, 128, 240, 0.1)',
    borderRadius: 10,
  },
  errorBanner: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FDEBEC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F7BCC0',
  },
  errorText: {
    color: '#C63535',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
});
