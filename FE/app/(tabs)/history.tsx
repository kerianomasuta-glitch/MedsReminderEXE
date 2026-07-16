import Ionicons from "@expo/vector-icons/Ionicons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DepthCard } from "@/components/meds/depth-ui";
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

        <View style={styles.sectionHeader}>
          <Text style={styles.title}>Lịch sử uống thuốc</Text>
          <Text style={styles.subtitle}>
            Xem lại tiến độ và tỷ lệ tuân thủ của bạn.
          </Text>
        </View>

        <DepthCard style={styles.emptyCard}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="bar-chart-outline" size={32} color={colors.textLink} />
          </View>
          <Text style={styles.emptyTitle}>Chưa có dữ liệu lịch sử</Text>
          <Text style={styles.emptyText}>
            Lịch sử uống thuốc sẽ hiển thị tại đây sau khi bạn bắt đầu ghi nhận các lần uống thuốc.
          </Text>
        </DepthCard>
      </ScrollView>
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
    paddingBottom: 40,
  },
  sectionHeader: {
    marginBottom: spacing.sm,
    gap: spacing.xxs,
  },
  title: {
    ...typography.displayMd,
    fontFamily: fonts.sansSemiBold,
    color: colors.ink,
    letterSpacing: -0.5,
  },
  subtitle: {
    ...typography.bodySm,
    fontFamily: fonts.sans,
    color: colors.body,
  },
  emptyCard: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.base,
    gap: spacing.xs,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.brandNameSoft,
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
