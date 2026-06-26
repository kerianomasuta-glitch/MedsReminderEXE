import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';

import { MedsTheme } from '@/constants/meds-theme';
import { useAuth } from '@/store/auth-store';

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

export default function ScheduleScreen() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { accessToken, role } = useAuth();

  const fetchPrescriptions = useCallback(async () => {
    if (!accessToken) {
      setPrescriptions([]);
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

      if (response.data && response.data.data && response.data.data.prescriptions) {
        setPrescriptions(response.data.data.prescriptions);
      } else {
        setPrescriptions([]);
      }
    } catch (err: any) {
      console.error('Error fetching prescriptions:', err);
      setError(err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi tải đơn thuốc');
    } finally {
      setLoading(false);
    }
  }, [accessToken, role]);

  useFocusEffect(
    useCallback(() => {
      fetchPrescriptions();
    }, [fetchPrescriptions])
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Lịch uống thuốc</Text>
        <Text style={styles.subtitle}>Theo dõi danh sách đơn thuốc và lịch uống thuốc của bệnh nhân.</Text>

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
          </View>
        ) : (
          <View style={styles.timeline}>
            {prescriptions.map((item) => (
              <Pressable key={item._id} onPress={() => router.push(`/medication/${item._id}`)}>
                <View style={styles.prescriptionCard}>
                  <View style={styles.cardHeader}>
                    <View style={styles.titleContainer}>
                      <Ionicons name="document-text" size={20} color={MedsTheme.colors.primaryDark} />
                      <Text style={styles.cardTitle}>{item.title}</Text>
                    </View>
                    {item.doctorName && (
                      <Text style={styles.doctorText}>BS: {item.doctorName}</Text>
                    )}
                  </View>

                  {item.note && (
                    <Text style={styles.noteText}>Ghi chú: {item.note}</Text>
                  )}

                  <View style={styles.medicationsList}>
                    <Text style={styles.medicationSectionTitle}>Danh sách thuốc:</Text>
                    {item.medications.map((med) => (
                      <View key={med._id} style={styles.medicationRow}>
                        <Ionicons name="medical" size={14} color={MedsTheme.colors.success} />
                        <Text style={styles.medicationName}>
                          {med.name} - <Text style={styles.medicationDose}>{med.dosage}</Text>
                        </Text>
                      </View>
                    ))}
                  </View>

                  {(item.startDate || item.endDate) && (
                    <View style={styles.dateContainer}>
                      <Ionicons name="calendar-outline" size={14} color={MedsTheme.colors.textMuted} />
                      <Text style={styles.dateText}>
                        Thời gian: {item.startDate ? new Date(item.startDate).toLocaleDateString('vi-VN') : 'N/A'} - {item.endDate ? new Date(item.endDate).toLocaleDateString('vi-VN') : 'N/A'}
                      </Text>
                    </View>
                  )}
                </View>
              </Pressable>
            ))}
          </View>
        )}

        <Pressable style={styles.primaryButton} onPress={() => router.push('/medicines/new')}>
          <Ionicons name="add-circle" size={18} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>Thêm lịch uống thuốc</Text>
        </Pressable>
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
  timeline: {
    gap: 12,
  },
  centerContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: MedsTheme.colors.textMuted,
    fontSize: 15,
  },
  errorContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  errorText: {
    color: MedsTheme.colors.danger,
    fontSize: 16,
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
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyText: {
    color: MedsTheme.colors.textMuted,
    fontSize: 16,
  },
  prescriptionCard: {
    backgroundColor: MedsTheme.colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: MedsTheme.colors.border,
    padding: 16,
    shadowColor: MedsTheme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: MedsTheme.colors.border,
    paddingBottom: 8,
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardTitle: {
    color: MedsTheme.colors.textMain,
    fontWeight: '700',
    fontSize: 16,
  },
  doctorText: {
    fontSize: 13,
    color: MedsTheme.colors.textMuted,
    fontStyle: 'italic',
  },
  noteText: {
    fontSize: 14,
    color: MedsTheme.colors.warning,
    marginBottom: 10,
  },
  medicationsList: {
    gap: 6,
    marginBottom: 10,
  },
  medicationSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: MedsTheme.colors.textMain,
    marginBottom: 4,
  },
  medicationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  medicationName: {
    fontSize: 14,
    color: MedsTheme.colors.textMain,
    fontWeight: '500',
  },
  medicationDose: {
    color: MedsTheme.colors.textMuted,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 12,
    color: MedsTheme.colors.textMuted,
  },
  primaryButton: {
    marginTop: 26,
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
