import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import {
  MedicationStatus,
  todayMedications,
  upcomingMedication,
} from "@/constants/meds-data";
import { MedsTheme } from "@/constants/meds-theme";

const statusLabel: Record<MedicationStatus, string> = {
  taken: "Đã uống",
  upcoming: "Sắp tới",
  late: "Trễ giờ",
  missed: "Bỏ qua",
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

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
              <Pressable style={styles.iconButton}>
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
            <Text style={styles.sectionDate}>Thứ Tư, 24 Tháng 5</Text>
          </View>

          <Text style={styles.groupLabel}>SẮP TỚI</Text>
          <View style={styles.upcomingCard}>
            <View style={styles.upcomingHeader}>
              <View>
                <Text style={styles.upcomingTime}>
                  {upcomingMedication.time}
                </Text>
                <View style={styles.upcomingBadge}>
                  <Text style={styles.upcomingBadgeText}>
                    {upcomingMedication.reminderIn}
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

            <Text style={styles.upcomingName}>{upcomingMedication.name}</Text>
            <Text style={styles.upcomingDose}>{upcomingMedication.dose}</Text>

            <Pressable style={styles.doneButton}>
              <Text style={styles.doneButtonText}>Đã uống</Text>
            </Pressable>
          </View>

          <View style={styles.dayHeader}>
            <Text style={styles.groupLabel}>TẤT CẢ TRONG NGÀY</Text>
            <Pressable onPress={() => router.push("/schedule")}>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </Pressable>
          </View>

          {todayMedications.map((item) => (
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
                      item.icon === "medical"
                        ? "medkit"
                        : item.icon === "water"
                          ? "water"
                          : "medical"
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
          onPress={() => router.push("/add-medication")}
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
});
