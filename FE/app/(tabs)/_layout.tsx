import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { TAB_DOCK_LAYOUT } from '@/constants/tab-dock';
import { MedsTheme } from '@/constants/meds-theme';

const { colors, fonts, radius } = MedsTheme;

const TAB_DOCK_BOTTOM = TAB_DOCK_LAYOUT.bottomOffset;

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.brandName,
        tabBarInactiveTintColor: colors.muted,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarLabelStyle: {
          fontFamily: fonts.sansMedium,
          fontSize: 10,
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: TAB_DOCK_BOTTOM,
          height: TAB_DOCK_LAYOUT.height,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 10 : 8,
          backgroundColor: colors.canvas,
          borderTopWidth: 0,
          borderRadius: 28,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.85)',
          borderTopColor: '#FFFFFF',
          ...MedsTheme.elevation.dock,
        },
        tabBarItemStyle: {
          borderRadius: radius.md,
        },
        tabBarBackground: () => (
          <View style={styles.tabBarBg}>
            <View style={styles.tabBarShine} />
          </View>
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons size={focused ? size + 1 : size} name={focused ? 'home' : 'home-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Lịch uống',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons size={focused ? size + 1 : size} name={focused ? 'calendar' : 'calendar-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="prescriptions"
        options={{
          title: 'Đơn thuốc',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              size={focused ? size + 1 : size}
              name={focused ? 'document-text' : 'document-text-outline'}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Lịch sử',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons size={focused ? size + 1 : size} name={focused ? 'time' : 'time-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Cá nhân',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons size={focused ? size + 1 : size} name={focused ? 'person' : 'person-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarBg: {
    flex: 1,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: colors.canvas,
  },
  tabBarShine: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: radius.pill,
  },
});
