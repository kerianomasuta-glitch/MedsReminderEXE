import { useSyncExternalStore } from 'react';

import { appointmentMock } from '@/constants/app-mock';

export type AppointmentItem = {
  id: string;
  title: string;
  hospital: string;
  doctor: string;
  date: string;
  time: string;
  address: string;
  note: string;
  status: string;
};

export type AppointmentInput = Omit<AppointmentItem, 'id' | 'status'>;

let appointments: AppointmentItem[] = [...appointmentMock];
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return appointments;
}

export function useAppointments() {
  return useSyncExternalStore(subscribe, getSnapshot);
}

export function getAppointmentById(id?: string) {
  if (!id) return undefined;
  return appointments.find((item) => item.id === id);
}

export function addAppointment(input: AppointmentInput) {
  const next: AppointmentItem = {
    ...input,
    id: `apt-${Date.now()}`,
    status: 'Sắp tới',
  };
  appointments = [next, ...appointments];
  emitChange();
}

export function updateAppointment(id: string, input: AppointmentInput) {
  appointments = appointments.map((item) => (item.id === id ? { ...item, ...input } : item));
  emitChange();
}
