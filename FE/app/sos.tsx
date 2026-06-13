import Ionicons from '@expo/vector-icons/Ionicons';
import * as Linking from 'expo-linking';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { emergencyContacts } from '@/constants/meds-data';
import { MedsTheme } from '@/constants/meds-theme';

export default function SosScreen() {
  const callEmergency = async () => {
    await Linking.openURL('tel:115');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>System</Text>
            <Text style={styles.headerSub}>Emergency Help</Text>
          </View>
          <View style={styles.gpsBadge}>
            <View style={styles.gpsDot} />
            <Text style={styles.gpsText}>Live GPS Active</Text>
          </View>
        </View>

        <View style={styles.sosHero}>
          <View style={styles.sosRingOuter}>
            <View style={styles.sosRingMid}>
              <Pressable style={styles.sosCircle}>
                <Text style={styles.sosText}>SOS</Text>
                <Text style={styles.sosHint}>Press & Hold to Activate</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.protocolWrap}>
          <Text style={styles.protocolTitle}>Emergency Protocol</Text>
          <Text style={styles.protocolText}>
            Activating SOS will alert medical services and your primary contacts with your current location.
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          <Text style={styles.editText}>Edit List</Text>
        </View>

        {emergencyContacts.map((contact) => (
          <View key={contact.id} style={styles.contactCard}>
            <View style={styles.contactAvatar}>
              <Ionicons name="person" size={16} color={MedsTheme.colors.primaryDark} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{contact.name}</Text>
              <Text style={styles.contactRole}>{contact.role}</Text>
            </View>
            <Pressable style={styles.callButton}>
              <Ionicons name="call" size={16} color="#FFFFFF" />
            </Pressable>
          </View>
        ))}

        <View style={styles.locationCard}>
          <View style={styles.locationHead}>
            <View style={styles.locationIcon}>
              <Ionicons name="locate" size={16} color={MedsTheme.colors.primaryDark} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.locationTitle}>Location Sharing Active</Text>
              <Text style={styles.locationSub}>
                Your location is being updated every 30 seconds to the emergency cloud.
              </Text>
            </View>
          </View>
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map" size={38} color="#7AAAE4" />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.ambulanceButton} onPress={callEmergency}>
          <Ionicons name="medical" size={18} color="#FFFFFF" />
          <Text style={styles.ambulanceText}>Call Ambulance (115)</Text>
        </Pressable>
        <Pressable style={styles.medicalIdButton}>
          <Ionicons name="document-text-outline" size={17} color={MedsTheme.colors.primaryDark} />
          <Text style={styles.medicalIdText}>Show Medical ID</Text>
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
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 28,
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 31,
    fontWeight: '800',
    color: MedsTheme.colors.textMain,
  },
  headerSub: {
    color: MedsTheme.colors.textMuted,
    marginTop: -2,
  },
  gpsBadge: {
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFEFF0',
    borderWidth: 1,
    borderColor: '#F8CDD2',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gpsDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#D62B3A',
  },
  gpsText: {
    color: '#B03542',
    fontWeight: '700',
    fontSize: 12,
  },
  sosHero: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  sosRingOuter: {
    width: 228,
    height: 228,
    borderRadius: 114,
    borderWidth: 1,
    borderColor: '#E7D7DC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosRingMid: {
    width: 186,
    height: 186,
    borderRadius: 93,
    borderWidth: 1,
    borderColor: '#E9DDE1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosCircle: {
    width: 136,
    height: 136,
    borderRadius: 68,
    backgroundColor: '#C71E24',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 53,
    letterSpacing: 1,
  },
  sosHint: {
    marginTop: 1,
    color: '#FFECEE',
    fontSize: 11,
    fontWeight: '600',
  },
  protocolWrap: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 4,
    marginBottom: 4,
  },
  protocolTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: MedsTheme.colors.textMain,
  },
  protocolText: {
    marginTop: 4,
    textAlign: 'center',
    color: MedsTheme.colors.textMuted,
    lineHeight: 20,
  },
  sectionHeader: {
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: MedsTheme.colors.textMain,
  },
  editText: {
    color: MedsTheme.colors.primary,
    fontWeight: '600',
  },
  contactCard: {
    height: 74,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MedsTheme.colors.border,
    backgroundColor: MedsTheme.colors.card,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0EDF9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    color: MedsTheme.colors.textMain,
    fontWeight: '700',
    fontSize: 16,
  },
  contactRole: {
    marginTop: 2,
    color: MedsTheme.colors.textMuted,
    fontSize: 12,
  },
  callButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#0A67C5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationCard: {
    marginTop: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: MedsTheme.colors.border,
    backgroundColor: '#F2F7FF',
    padding: 12,
    gap: 10,
  },
  locationHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D9E9FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationTitle: {
    color: MedsTheme.colors.primaryDark,
    fontWeight: '700',
    fontSize: 16,
  },
  locationSub: {
    color: MedsTheme.colors.textMuted,
    marginTop: 2,
    fontSize: 12,
  },
  mapPlaceholder: {
    height: 110,
    borderRadius: 10,
    backgroundColor: '#DDE9F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#DCE5F3',
    backgroundColor: MedsTheme.colors.pageBackground,
    gap: 10,
  },
  ambulanceButton: {
    height: 48,
    borderRadius: 10,
    backgroundColor: '#C61E24',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  ambulanceText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  medicalIdButton: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1.2,
    borderColor: MedsTheme.colors.primary,
    backgroundColor: '#F8FCFF',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  medicalIdText: {
    color: MedsTheme.colors.primaryDark,
    fontWeight: '700',
    fontSize: 15,
  },
});
