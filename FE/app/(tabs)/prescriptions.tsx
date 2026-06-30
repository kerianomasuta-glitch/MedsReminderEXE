import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PatientTabHeader } from '@/components/meds/patient-tab-header';
import { MedsTheme } from '@/constants/meds-theme';
import {
  getPrescriptionErrorMessage,
  getPrescriptionsByPatientApi,
} from '@/services/prescription-api';
import { resolveAuthUserId, useAuth } from '@/store/auth-store';

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
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <PatientTabHeader />

        <Text style={styles.title}>Danh sách đơn thuốc</Text>
        <Text style={styles.subtitle}>Quản lý các đơn thuốc điều trị của bệnh nhân.</Text>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={MedsTheme.colors.primary} />
            <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color={MedsTheme.colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={fetchPrescriptions}>
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </Pressable>
          </View>
        ) : prescriptions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color={MedsTheme.colors.textMuted} />
            <Text style={styles.emptyText}>Bệnh nhân này chưa có đơn thuốc nào.</Text>
            <Pressable style={styles.primaryButton} onPress={() => router.push('/medication/new')}>
              <Ionicons name="add-circle" size={18} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Thêm đơn thuốc mới</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {prescriptions.map((pres) => (
              <Pressable
                key={pres._id}
                style={styles.prescriptionCard}
                onPress={() => router.push({ pathname: '/medication/[id]', params: { id: pres._id } })}>
                <View style={styles.cardHeader}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="document-text" size={20} color={MedsTheme.colors.primaryDark} />
                  </View>
                  <View style={styles.headerInfo}>
                    <Text style={styles.cardTitle}>{pres.title}</Text>
                    {pres.doctorName && (
                      <Text style={styles.doctorText}>Bác sĩ: {pres.doctorName}</Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={MedsTheme.colors.textMuted} />
                </View>

                {pres.note && (
                  <Text style={styles.noteText} numberOfLines={1}>
                    Ghi chú: {pres.note}
                  </Text>
                )}

                <View style={styles.cardFooter}>
                  <Ionicons name="calendar-outline" size={14} color={MedsTheme.colors.textMuted} />
                  <Text style={styles.dateText}>
                    {pres.startDate ? new Date(pres.startDate).toLocaleDateString('vi-VN') : 'N/A'} -{' '}
                    {pres.endDate ? new Date(pres.endDate).toLocaleDateString('vi-VN') : 'N/A'}
                  </Text>
                  <Text style={styles.medsCount}>
                    {pres.medications?.length || 0} loại thuốc
                  </Text>
                </View>
              </Pressable>
            ))}

            <Pressable style={styles.primaryButton} onPress={() => router.push('/medication/new')}>
              <Ionicons name="add-circle" size={18} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Thêm đơn thuốc mới</Text>
            </Pressable>
          </View>
        )}
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
    paddingTop: 12,
    paddingBottom: 40,
  },
  title: {
    fontSize: 29,
    fontWeight: '800',
    color: MedsTheme.colors.textMain,
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 18,
    color: MedsTheme.colors.textMuted,
    fontSize: 15,
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    color: MedsTheme.colors.textMuted,
    fontSize: 15,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  errorText: {
    color: MedsTheme.colors.danger,
    fontSize: 15,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: MedsTheme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    color: MedsTheme.colors.textMuted,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 10,
  },
  listContainer: {
    gap: 12,
  },
  prescriptionCard: {
    backgroundColor: MedsTheme.colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: MedsTheme.colors.border,
    padding: 16,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: MedsTheme.colors.textMain,
  },
  doctorText: {
    fontSize: 13,
    color: MedsTheme.colors.textMuted,
    marginTop: 2,
  },
  noteText: {
    fontSize: 13,
    color: MedsTheme.colors.textMuted,
    backgroundColor: '#F5F7FA',
    padding: 8,
    borderRadius: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dateText: {
    fontSize: 12,
    color: MedsTheme.colors.textMuted,
    marginLeft: 6,
    flex: 1,
  },
  medsCount: {
    fontSize: 12,
    fontWeight: '700',
    color: MedsTheme.colors.primaryDark,
    backgroundColor: '#EAF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  primaryButton: {
    marginTop: 10,
    borderRadius: 12,
    height: 48,
    backgroundColor: MedsTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
