import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { historyDateStripMock } from "@/constants/app-mock";
import { historyDetail, historyScores } from "@/constants/meds-data";
import { MedsTheme } from "@/constants/meds-theme";

const { colors, typography, radius, spacing, fonts } = MedsTheme;

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
              color={colors.ink}
            />
          </View>
          <Text style={styles.user}>MedsReminder</Text>
          <View style={{ flex: 1 }} />
          <Ionicons
            name="notifications-outline"
            size={20}
            color={colors.ink}
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
                color={colors.ink}
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
    backgroundColor: colors.canvas,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm + 2,
    gap: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  user: {
    ...typography.displayMd,
    fontFamily: fonts.sansSemiBold,
    color: colors.ink,
  },
  title: {
    ...typography.displayLg,
    fontFamily: fonts.sansSemiBold,
    color: colors.ink,
  },
  subtitle: {
    marginTop: 3,
    ...typography.bodySm,
    fontFamily: fonts.sans,
    color: colors.body,
    marginBottom: spacing.sm,
  },
  dateStrip: {
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.hairlineStrong,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm + 2,
  },
  datePill: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.md,
    minWidth: 36,
    alignItems: "center",
  },
  datePillActive: {
    backgroundColor: colors.primary,
  },
  dateText: {
    color: colors.muted,
    fontFamily: fonts.sansMedium,
    fontSize: 13,
  },
  dateTextActive: {
    color: colors.onPrimary,
  },
  progressCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.hairlineStrong,
    backgroundColor: colors.surfaceCard,
    padding: spacing.base,
    ...MedsTheme.elevation.card,
  },
  progressTitle: {
    ...typography.titleMd,
    fontFamily: fonts.sansSemiBold,
    color: colors.ink,
  },
  circleWrap: {
    alignItems: "center",
    paddingVertical: spacing.base,
  },
  circle: {
    width: 166,
    height: 166,
    borderRadius: 83,
    borderWidth: 10,
    borderColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.canvasSoft,
  },
  circlePercent: {
    fontSize: 36,
    fontFamily: fonts.sansSemiBold,
    color: colors.ink,
  },
  circleSub: {
    marginTop: 2,
    color: colors.body,
    fontFamily: fonts.sansMedium,
  },
  statsRow: {
    marginTop: spacing.sm,
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: radius.lg,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
  },
  statOnTime: {
    backgroundColor: '#ECFDF3',
    borderColor: '#BBF7D0',
  },
  statLate: {
    backgroundColor: '#FFF8EE',
    borderColor: '#F0D9A8',
  },
  statSkip: {
    backgroundColor: '#FFF9F9',
    borderColor: colors.semanticError,
  },
  statNum: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 25,
    color: colors.ink,
  },
  statLabel: {
    marginTop: 2,
    color: colors.body,
    fontFamily: fonts.sansMedium,
    fontSize: 13,
  },
  todayTitle: {
    marginTop: 18,
    marginBottom: 10,
    ...typography.displayMd,
    fontFamily: fonts.sansSemiBold,
    color: colors.ink,
  },
  detailCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.hairlineStrong,
    padding: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: spacing.xs,
    ...MedsTheme.elevation.card,
  },
  detailIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  detailInfo: {
    flex: 1,
  },
  detailTime: {
    ...typography.titleSm,
    fontFamily: fonts.sansSemiBold,
    color: colors.ink,
  },
  detailName: {
    marginTop: 2,
    ...typography.bodySm,
    fontFamily: fonts.sans,
    color: colors.body,
  },
  resultBadge: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  badgeTaken: {
    backgroundColor: '#ECFDF3',
  },
  badgeLate: {
    backgroundColor: '#FFF8EE',
  },
  resultBadgeText: {
    fontSize: 12,
    fontFamily: fonts.sansSemiBold,
    color: colors.ink,
  },
});
