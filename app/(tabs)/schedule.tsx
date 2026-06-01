import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { todayMedications } from '@/constants/meds-data';
import { MedsTheme } from '@/constants/meds-theme';

export default function ScheduleScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Lịch uống thuốc</Text>
        <Text style={styles.subtitle}>Theo dõi lịch uống theo khung giờ trong ngày.</Text>

        <View style={styles.timeline}>
          {todayMedications.map((item) => (
            <Pressable
              key={item.id}
              style={styles.timelineRow}
              onPress={() => router.push({ pathname: '/medication/[id]', params: { id: item.id } })}>
              <View style={styles.timeBlock}>
                <Text style={styles.timeText}>{item.time}</Text>
              </View>

              <View style={styles.card}>
                <View style={styles.iconWrap}>
                  <Ionicons name="medical" size={16} color={MedsTheme.colors.primaryDark} />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Text style={styles.cardDose}>{item.dose}</Text>
                </View>
                <Ionicons name="chevron-forward" size={17} color={MedsTheme.colors.textMuted} />
              </View>
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.primaryButton} onPress={() => router.push('/add-medication')}>
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
    gap: 10,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeBlock: {
    width: 88,
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#E9F2FF',
    borderWidth: 1,
    borderColor: '#D3E4FA',
  },
  timeText: {
    color: MedsTheme.colors.primaryDark,
    fontWeight: '700',
    fontSize: 14,
  },
  card: {
    flex: 1,
    backgroundColor: MedsTheme.colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: MedsTheme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    color: MedsTheme.colors.textMain,
    fontWeight: '700',
    fontSize: 16,
  },
  cardDose: {
    marginTop: 2,
    color: MedsTheme.colors.textMuted,
    fontSize: 13,
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
