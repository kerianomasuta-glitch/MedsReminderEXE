import Ionicons from "@expo/vector-icons/Ionicons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PatientTabHeader } from "@/components/meds/patient-tab-header";
import { MedsTheme } from "@/constants/meds-theme";

const { colors, typography, spacing, fonts, radius } = MedsTheme;

export default function HistoryScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <PatientTabHeader />

        <Text style={styles.title}>Lịch sử uống thuốc</Text>
        <Text style={styles.subtitle}>
          Xem lại tiến độ và tỷ lệ tuân thủ của bạn.
        </Text>

        <View style={styles.emptyCard}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="bar-chart-outline" size={32} color={colors.textLink} />
          </View>
          <Text style={styles.emptyTitle}>Chưa có dữ liệu lịch sử</Text>
          <Text style={styles.emptyText}>
            Lịch sử uống thuốc sẽ hiển thị tại đây sau khi bạn bắt đầu ghi nhận các lần uống thuốc.
          </Text>
        </View>
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
  emptyCard: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.base,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.hairlineStrong,
    backgroundColor: colors.surfaceCard,
    gap: spacing.xs,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#E8F4FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xxs,
  },
  emptyTitle: {
    ...typography.titleSm,
    fontFamily: fonts.sansSemiBold,
    color: colors.ink,
    textAlign: "center",
  },
  emptyText: {
    ...typography.bodySm,
    fontFamily: fonts.sans,
    color: colors.body,
    textAlign: "center",
    lineHeight: 20,
  },
});
