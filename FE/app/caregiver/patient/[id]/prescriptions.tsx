import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { EmptyState, FloatingAddButton, ListItemCard, SectionHeader } from '@/components/meds/caregiver-ui';
import { ActionButton, AppScreen, SectionCard } from '@/components/meds/ui-kit';
import { MedsTheme } from '@/constants/meds-theme';
import {
  formatPrescriptionMedications,
  formatPrescriptionPeriod,
  getPrescriptionErrorMessage,
  getPrescriptionsByPatientApi,
  type PrescriptionSummary,
} from '@/services/prescription-api';
import { useAuth } from '@/store/auth-store';

export default function CaregiverPatientPrescriptionsScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const { accessToken } = useAuth();
  const [prescriptions, setPrescriptions] = useState<PrescriptionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const patientName = name?.trim() || 'Bệnh nhân';

  const loadPrescriptions = useCallback(async () => {
    if (!accessToken || !id) {
      setPrescriptions([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await getPrescriptionsByPatientApi({ patientId: id }, accessToken);
      setPrescriptions(response.data.prescriptions ?? []);
    } catch (err) {
      setError(getPrescriptionErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [accessToken, id]);

  useFocusEffect(
    useCallback(() => {
      void loadPrescriptions();
    }, [loadPrescriptions]),
  );

  return (
    <AppScreen hero paddedBottom={40}>
      <Stack.Screen options={{ title: 'Đơn thuốc', headerShadowVisible: false }} />

      <View style={styles.heroText}>
        <Text style={styles.heroTitle}>Đơn thuốc</Text>
        <Text style={styles.heroSubtitle}>Bệnh nhân: {patientName}</Text>
      </View>

      <FloatingAddButton
        label="Thêm đơn thuốc mới"
        onPress={() => router.push({ pathname: '/medication/new', params: { patientId: id, patientName } })}
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={MedsTheme.colors.ink} />
          <Text style={styles.meta}>Đang tải đơn thuốc...</Text>
        </View>
      ) : error ? (
        <SectionCard>
          <Text style={styles.error}>{error}</Text>
          <ActionButton label="Thử lại" tone="secondary" onPress={() => void loadPrescriptions()} />
        </SectionCard>
      ) : prescriptions.length === 0 ? (
        <SectionCard>
          <EmptyState
            icon="document-text-outline"
            title="Chưa có đơn thuốc"
            message="Thêm đơn thuốc đầu tiên để bắt đầu theo dõi điều trị."
            accent={MedsTheme.colors.textLink}
            accentSoft="#E8F4FF"
          />
        </SectionCard>
      ) : (
        <View style={styles.listSection}>
          <SectionHeader title={`${prescriptions.length} đơn thuốc`} icon="folder-open-outline" />
          {prescriptions.map((pres) => {
            const lines: string[] = [];
            lines.push(`Thuốc: ${formatPrescriptionMedications(pres.medications)}`);
            if (pres.doctorName) lines.push(`Bác sĩ: ${pres.doctorName}`);
            const period = formatPrescriptionPeriod(pres);
            if (period) lines.push(period);
            if (pres.note) lines.push(`Ghi chú: ${pres.note}`);

            return (
              <ListItemCard
                key={pres._id}
                title={pres.title ?? 'Đơn thuốc'}
                lines={lines}
                icon="document-text"
                accent={MedsTheme.colors.textLink}
                accentSoft="#E8F4FF"
                onPress={() => router.push({ pathname: '/medication/[id]', params: { id: pres._id, patientName } })}
              />
            );
          })}
        </View>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  heroText: {
    marginBottom: MedsTheme.spacing.xxs,
  },
  heroTitle: {
    fontSize: 28,
    fontFamily: MedsTheme.fonts.sansSemiBold,
    color: MedsTheme.colors.ink,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    marginTop: 4,
    fontSize: 14,
    fontFamily: MedsTheme.fonts.sans,
    color: MedsTheme.colors.body,
  },
  listSection: {
    gap: MedsTheme.spacing.sm,
  },
  center: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 10,
  },
  meta: {
    color: MedsTheme.colors.body,
    fontFamily: MedsTheme.fonts.sans,
    fontSize: 14,
  },
  error: {
    color: MedsTheme.colors.critical,
    fontFamily: MedsTheme.fonts.sansMedium,
    fontSize: 14,
  },
});
