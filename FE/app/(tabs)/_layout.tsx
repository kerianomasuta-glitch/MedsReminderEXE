import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { MedsTheme } from '@/constants/meds-theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: MedsTheme.colors.ink,
        tabBarInactiveTintColor: MedsTheme.colors.muted,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarLabelStyle: {
          fontFamily: MedsTheme.fonts.sansMedium,
          fontSize: 11,
        },
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: MedsTheme.colors.hairline,
          height: 74,
          paddingTop: 8,
          paddingBottom: 10,
          backgroundColor: MedsTheme.colors.canvas,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons size={size} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ color, size }) => <Ionicons size={size} name="calendar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="prescriptions"
        options={{
          title: 'Đơn thuốc',
          tabBarIcon: ({ color, size }) => <Ionicons size={size} name="document-text" color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => <Ionicons size={size} name="time" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons size={size} name="person" color={color} />,
        }}
      />
    </Tabs>
  );
}
