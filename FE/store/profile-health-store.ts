import { useSyncExternalStore } from 'react';

import { userMock } from '@/constants/app-mock';

export type ProfileHealthState = {
  name: string;
  age: string;
  birthday: string;
  gender: string;
  phone: string;
  email: string;
  emergencyContact: string;
  emergencyPhone: string;
  conditions: string[];
  allergies: string;
  notes: string;
};

let profile: ProfileHealthState = {
  name: userMock.name,
  age: String(userMock.age),
  birthday: userMock.birthday,
  gender: userMock.gender,
  phone: userMock.phone,
  email: userMock.email,
  emergencyContact: userMock.emergencyContact,
  emergencyPhone: userMock.emergencyPhone,
  conditions: [...userMock.conditions],
  allergies: userMock.allergies,
  notes: userMock.notes,
};

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return profile;
}

export function useProfileHealth() {
  return useSyncExternalStore(subscribe, getSnapshot);
}

export function updateProfileHealth(next: ProfileHealthState) {
  profile = { ...next, conditions: [...next.conditions] };
  emitChange();
}
