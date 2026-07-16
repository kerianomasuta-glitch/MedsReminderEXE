import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DepthButton, DepthCard, StaggerIn } from '@/components/meds/depth-ui';
import { PatientTabHeader } from '@/components/meds/patient-tab-header';
import { tabDockScrollPadding } from '@/constants/tab-dock';
import { MedsTheme } from '@/constants/meds-theme';
import {
  getPrescriptionErrorMessage,
  getPrescriptionsByPatientApi,
} from '@/services/prescription-api';
import { resolveAuthUserId, useAuth } from '@/store/auth-store';

const { colors, typography, radius, spacing, fonts } = MedsTheme;

interface Medication {
  _id: string;
  name: string;
  dosage: string;
  form?: string;
  unit?: string;
}

interface Prescription {
  _id: string;
  title: string;
  doctorName?: string;
  startDate?: string;
  endDate?: string;
  note?: string;
  medications: Medication[];
}

export default function PrescriptionsScreen() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { accessToken, role, user } = useAuth();

  const fetchPrescriptions = useCallback(async () => {
    const patientId = resolveAuthUserId(user);
    if (!accessToken || role !== 'patient' || !patientId) {
      setPrescriptions([]);
      setError(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await getPrescriptionsByPatientApi({ patientId, page: 1, limit: 20 }, accessToken);
      setPrescriptions((response.data.prescriptions ?? []) as Prescription[]);
    } catch (err: unknown) {
      setError(getPrescriptionErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [accessToken, role, user]);

  useFocusEffect(
    useCallback(() => {
      fetchPrescriptions();
    }, [fetchPrescriptions])
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: tabDockScrollPadding() }]}
        showsVerticalScrollIndicator={false}>
        <PatientTabHeader />

        <Animated.View entering={FadeInDown.delay(60).duration(450).springify()} style={styles.sectionHeader}>
          <Text style={styles.title}>Đơn thuốc</Text>
          <Text style={styles.subtitle}>Quản lý các đơn thuốc điều trị của bạn.</Text>
        </Animated.View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="small" color={colors.brandName} />
            <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="alert-circle-outline" size={28} color={colors.critical} />
            </View>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={fetchPrescriptions}>
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </Pressable>
          </View>
        ) : prescriptions.length === 0 ? (
          <DepthCard style={styles.emptyContainer}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="document-text-outline" size={32} color={colors.brandName} />
            </View>
            <Text style={styles.emptyTitle}>Chưa có đơn thuốc</Text>
            <Text style={styles.emptyText}>Thêm đơn thuốc mới để theo dõi thuốc điều trị dễ dàng hơn.</Text>
            <DepthButton
              label="Thêm đơn thuốc mới"
              tone="brand"
              icon={<Ionicons name="add" size={18} color={colors.onPrimary} />}
              onPress={() => router.push('/medication/new')}
            />
          </DepthCard>
        ) : (
          <View style={styles.listContainer}>
            {prescriptions.map((pres, index) => (
              <StaggerIn key={pres._id} index={index}>
                <DepthCard
                  style={styles.prescriptionCard}
                  onPress={() => router.push({ pathname: '/medication/[id]', params: { id: pres._id } })}
                  depth="sm">
                  <View style={styles.cardAccent} />
                  <View style={styles.cardHeader}>
                    <View style={styles.iconContainer}>
                      <Ionicons name="document-text" size={18} color={colors.brandName} />
                    </View>
                    <View style={styles.headerInfo}>
                      <Text style={styles.cardTitle} numberOfLines={1}>
                        {pres.title || 'Đơn thuốc'}
                      </Text>
                      {pres.doctorName ? (
                        <Text style={styles.doctorText} numberOfLines={1}>
                          BS. {pres.doctorName}
                        </Text>
                      ) : null}
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.muted} />
                  </View>

                  {pres.note ? (
                    <Text style={styles.noteText} numberOfLines={2}>
                      {pres.note}
                    </Text>
                  ) : null}

                  <View style={styles.cardFooter}>
                    <View style={styles.medsCount}>
                      <Ionicons name="medkit-outline" size={13} color={colors.brandName} />
                      <Text style={styles.medsCountText}>
                        {pres.medications?.length || 0} loại thuốc
                      </Text>
                    </View>
                  </View>
                </DepthCard>
              </StaggerIn>
            ))}

            <DepthButton
              label="Thêm đơn thuốc mới"
              tone="brand"
              icon={<Ionicons name="add" size={18} color={colors.onPrimary} />}
              onPress={() => router.push('/medication/new')}
            />
          </View>
        )}
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
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.xs,
  },
  loadingText: {
    color: colors.body,
    ...typography.bodySm,
    fontFamily: fonts.sansMedium,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  errorText: {
    color: colors.critical,
    ...typography.bodySm,
    fontFamily: fonts.sansMedium,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.brandName,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
  },
  retryButtonText: {
    color: colors.onPrimary,
    fontFamily: fonts.sansSemiBold,
    ...typography.button,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.base,
    gap: spacing.xs,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.brandNameSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxs,
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
    textAlign: 'center',
    lineHeight: 20,
  },
  listContainer: {
    gap: spacing.sm,
  },
  prescriptionCard: {
    padding: spacing.base,
    gap: spacing.xs,
    overflow: 'hidden',
  },
  cardAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: colors.brandName,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingLeft: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.brandNameSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.9)',
    borderColor: 'rgba(27, 61, 110, 0.1)',
    shadowColor: colors.brandName,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  headerInfo: {
    flex: 1,
  },
  cardTitle: {
    ...typography.titleSm,
    fontFamily: fonts.sansSemiBold,
    color: colors.ink,
  },
  doctorText: {
    ...typography.caption,
    fontFamily: fonts.sans,
    color: colors.body,
    marginTop: 2,
  },
  noteText: {
    ...typography.caption,
    fontFamily: fonts.sans,
    color: colors.body,
    backgroundColor: colors.canvasSoft,
    padding: spacing.sm,
    borderRadius: radius.md,
    marginLeft: 4,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xxs,
    paddingLeft: 4,
  },
  medsCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.brandNameSoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  medsCountText: {
    ...typography.caption,
    fontFamily: fonts.sansSemiBold,
    color: colors.brandName,
  },
});
