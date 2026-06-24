import { useSyncExternalStore } from 'react';

import type { MedicationItem, MedicationStatus } from '@/constants/meds-data';
import { todayMedications } from '@/constants/meds-data';

export type NewMedicationScheduleInput = {
  name: string;
  dose: string;
  formType: string;
  times: string;
};

let schedules: MedicationItem[] = [...todayMedications];
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return schedules;
}

export function useMedicationSchedules() {
  return useSyncExternalStore(subscribe, getSnapshot);
}

export function addMedicationSchedule(input: NewMedicationScheduleInput) {
  const firstTime = input.times
    .split(',')
    .map((item) => item.trim())
    .find(Boolean);

  const nextItem: MedicationItem = {
    id: `custom-${Date.now()}`,
    name: input.name.trim(),
    dose: `${input.dose.trim()} - ${input.formType}`,
    time: firstTime ?? '--:--',
    icon: 'medical',
    status: 'upcoming',
  };

  schedules = [nextItem, ...schedules];
  emitChange();
}

export function updateMedicationScheduleStatus(id: string, status: MedicationStatus) {
  schedules = schedules.map((item) => (item.id === id ? { ...item, status } : item));
  emitChange();
}
