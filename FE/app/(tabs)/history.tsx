import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { historyDateStripMock } from "@/constants/app-mock";
import { historyDetail, historyScores } from "@/constants/meds-data";
import { MedsTheme } from "@/constants/meds-theme";

export default function HistoryScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View style={styles.avatar}>
            <Ionicons
              name="person"
              size={16}
              color={MedsTheme.colors.primaryDark}
            />
          </View>
          <Text style={styles.user}>MedsReminder</Text>
          <View style={{ flex: 1 }} />
          <Ionicons
            name="notifications-outline"
            size={20}
            color={MedsTheme.colors.primaryDark}
          />
        </View>

        <Text style={styles.title}>Lịch sử uống thuốc</Text>
        <Text style={styles.subtitle}>
          Xem lại tiến độ và tỷ lệ tuần thủ của bạn.
        </Text>

        <View style={styles.dateStrip}>
          {historyDateStripMock.map((date, idx) => (
            <View
              key={date}
              style={[styles.datePill, idx === 4 && styles.datePillActive]}
            >
              <Text
                style={[styles.dateText, idx === 4 && styles.dateTextActive]}
              >
                {date}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Tỷ lệ tuần thủ tuần này</Text>
          <View style={styles.circleWrap}>
            <View style={styles.circle}>
              <Text style={styles.circlePercent}>
                {historyScores.weeklyPercent}%
              </Text>
              <Text style={styles.circleSub}>Tuyệt vời</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.statOnTime]}>
            <Text style={styles.statNum}>{historyScores.onTime}</Text>
            <Text style={styles.statLabel}>Đúng giờ</Text>
          </View>
          <View style={[styles.statCard, styles.statLate]}>
            <Text style={styles.statNum}>{historyScores.delayed}</Text>
            <Text style={styles.statLabel}>Trễ giờ</Text>
          </View>
          <View style={[styles.statCard, styles.statSkip]}>
            <Text style={styles.statNum}>{historyScores.skipped}</Text>
            <Text style={styles.statLabel}>Bỏ qua</Text>
          </View>
        </View>

        <Text style={styles.todayTitle}>Chi tiết hôm nay - Thứ Sáu, 16/10</Text>
        {historyDetail.map((item) => (
          <Pressable
            key={item.id}
            style={styles.detailCard}
            onPress={() =>
              router.push({
                pathname: "/medication/[id]",
                params: { id: item.id },
              })
            }
          >
            <View style={styles.detailIcon}>
              <Ionicons
                name="sunny"
                size={15}
                color={MedsTheme.colors.primaryDark}
              />
            </View>
            <View style={styles.detailInfo}>
              <Text style={styles.detailTime}>{item.time}</Text>
              <Text style={styles.detailName}>{item.name}</Text>
            </View>
            <View
              style={[
                styles.resultBadge,
                item.status === "taken" ? styles.badgeTaken : styles.badgeLate,
              ]}
            >
              <Text style={styles.resultBadgeText}>
                {item.status === "taken" ? "Đã uống" : "Trễ giờ"}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: MedsTheme.colors.appBackground,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#D7EDF9",
    alignItems: "center",
    justifyContent: "center",
  },
  user: {
    fontSize: 20,
    fontWeight: "700",
    color: MedsTheme.colors.textMain,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: MedsTheme.colors.textMain,
  },
  subtitle: {
    marginTop: 3,
    color: MedsTheme.colors.textMuted,
    marginBottom: 12,
  },
  dateStrip: {
    backgroundColor: MedsTheme.colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: MedsTheme.colors.border,
    paddingVertical: 12,
    paddingHorizontal: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  datePill: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 10,
    minWidth: 36,
    alignItems: "center",
  },
  datePillActive: {
    backgroundColor: MedsTheme.colors.primary,
  },
  dateText: {
    color: MedsTheme.colors.textMuted,
    fontWeight: "600",
    fontSize: 13,
  },
  dateTextActive: {
    color: "#FFFFFF",
  },
  progressCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: MedsTheme.colors.border,
    backgroundColor: MedsTheme.colors.card,
    padding: 16,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: MedsTheme.colors.textMain,
  },
  circleWrap: {
    alignItems: "center",
    paddingVertical: 16,
  },
  circle: {
    width: 166,
    height: 166,
    borderRadius: 83,
    borderWidth: 10,
    borderColor: MedsTheme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FBFF",
  },
  circlePercent: {
    fontSize: 36,
    fontWeight: "800",
    color: MedsTheme.colors.textMain,
  },
  circleSub: {
    marginTop: 2,
    color: MedsTheme.colors.primaryDark,
    fontWeight: "600",
  },
  statsRow: {
    marginTop: 12,
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
  },
  statOnTime: {
    backgroundColor: "#EAF4FF",
    borderColor: "#CFE4FF",
  },
  statLate: {
    backgroundColor: "#FFF4E8",
    borderColor: "#FFE4C1",
  },
  statSkip: {
    backgroundColor: "#FFF1F1",
    borderColor: "#FFCECE",
  },
  statNum: {
    fontWeight: "800",
    fontSize: 25,
    color: MedsTheme.colors.textMain,
  },
  statLabel: {
    marginTop: 2,
    color: MedsTheme.colors.textMuted,
    fontWeight: "600",
  },
  todayTitle: {
    marginTop: 18,
    marginBottom: 10,
    fontSize: 23,
    fontWeight: "700",
    color: MedsTheme.colors.textMain,
  },
  detailCard: {
    backgroundColor: MedsTheme.colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: MedsTheme.colors.border,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  detailIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#EAF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  detailInfo: {
    flex: 1,
  },
  detailTime: {
    fontSize: 16,
    fontWeight: "700",
    color: MedsTheme.colors.textMain,
  },
  detailName: {
    marginTop: 2,
    color: MedsTheme.colors.textMuted,
  },
  resultBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  badgeTaken: {
    backgroundColor: "#DDF5E8",
  },
  badgeLate: {
    backgroundColor: "#FFEBD4",
  },
  resultBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: MedsTheme.colors.textMain,
  },
});
