import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MedsTheme } from "@/constants/meds-theme";

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.content}>
        <View style={styles.topCard}>
          <View style={styles.avatar}>
            <Ionicons
              name="person"
              size={28}
              color={MedsTheme.colors.primaryDark}
            />
          </View>
          <Text style={styles.name}>MedsReminder User</Text>
          <Text style={styles.role}>Nhắc lịch uống thuốc mỗi ngày</Text>
        </View>

        <Pressable
          style={styles.rowButton}
          onPress={() => router.push("/schedule")}
        >
          <Ionicons
            name="calendar-outline"
            size={18}
            color={MedsTheme.colors.primaryDark}
          />
          <Text style={styles.rowButtonText}>Quản lý lịch uống</Text>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={MedsTheme.colors.textMuted}
          />
        </Pressable>

        <Pressable
          style={styles.rowButton}
          onPress={() => router.push("/history")}
        >
          <Ionicons
            name="time-outline"
            size={18}
            color={MedsTheme.colors.primaryDark}
          />
          <Text style={styles.rowButtonText}>Lịch sử uống thuốc</Text>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={MedsTheme.colors.textMuted}
          />
        </Pressable>

        <Pressable style={styles.sosCard} onPress={() => router.push("/sos")}>
          <View style={styles.sosIconWrap}>
            <Ionicons name="warning" size={20} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sosTitle}>Cảnh báo khẩn cấp</Text>
            <Text style={styles.sosText}>
              Mở nhanh SOS và cuộc gọi emergency
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 14,
    gap: 10,
  },
  topCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: MedsTheme.colors.border,
    backgroundColor: MedsTheme.colors.card,
    alignItems: "center",
    paddingVertical: 22,
    marginBottom: 8,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#D9EEFF",
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    marginTop: 10,
    color: MedsTheme.colors.textMain,
    fontSize: 21,
    fontWeight: "800",
  },
  role: {
    marginTop: 2,
    color: MedsTheme.colors.textMuted,
  },
  rowButton: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MedsTheme.colors.border,
    backgroundColor: MedsTheme.colors.card,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rowButtonText: {
    flex: 1,
    color: MedsTheme.colors.textMain,
    fontWeight: "600",
    fontSize: 15,
  },
  sosCard: {
    marginTop: 6,
    borderRadius: 14,
    backgroundColor: "#D72839",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sosIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.24)",
    alignItems: "center",
    justifyContent: "center",
  },
  sosTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
  sosText: {
    color: "#FFE8E8",
    marginTop: 2,
    fontSize: 13,
  },
});
