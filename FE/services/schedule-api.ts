import axios from 'axios';

import { API_BASE_URL } from '@/constants/api-config';
import { formatMedicationUsage } from '@/constants/medication-labels';

const scheduleApi = axios.create({
  baseURL: `${API_BASE_URL}/api/v1/schedules`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

export type ScheduleTimeSlot = {
  time: string;
  dosageNote?: string;
};

export type ScheduleFrequencyType = 'daily' | 'weekly' | 'interval' | 'as_needed';

export const DEFAULT_SCHEDULE_TIMEZONE = 'Asia/Ho_Chi_Minh';

export type CreateSchedulePayload = {
  patientId: string;
  prescriptionId: string;
  startDate: string;
  endDate?: string;
  frequencyType?: ScheduleFrequencyType;
  timeSlots: ScheduleTimeSlot[];
  daysOfWeek?: number[];
  intervalDays?: number;
  reminderMinutesBefore?: number;
  timezone?: string;
};

export type ScheduleSummary = {
  _id: string;
  patientId?: string;
  prescriptionId?: { _id?: string; title?: string } | string;
  startDate?: string;
  endDate?: string;
  frequencyType?: ScheduleFrequencyType;
  timeSlots?: ScheduleTimeSlot[];
  daysOfWeek?: number[];
  intervalDays?: number;
  isActive?: boolean;
  reminderMinutesBefore?: number;
  timezone?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type UpdateSchedulePayload = {
  startDate?: string;
  endDate?: string;
  frequencyType?: ScheduleFrequencyType;
  timeSlots?: ScheduleTimeSlot[];
  daysOfWeek?: number[];
  intervalDays?: number;
  reminderMinutesBefore?: number;
  timezone?: string;
  isActive?: boolean;
};

type ApiEnvelope<T> = {
  status: string;
  message: string;
  data: T;
};

function buildAuthHeaders(accessToken?: string) {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;
}

export function getScheduleErrorMessage(error: unknown) {
  if (axios.isAxiosError(error) && error.response?.data?.message) {
    return String(error.response.data.message);
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Có lỗi xảy ra';
}

export function formatScheduleFrequency(type?: string) {
  switch (type) {
    case 'daily':
      return 'Hàng ngày';
    case 'weekly':
      return 'Hàng tuần';
    case 'interval':
      return 'Theo khoảng ngày';
    case 'as_needed':
      return 'Khi cần';
    default:
      return type ?? '';
  }
}

const WEEKDAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'] as const;

export function formatDaysOfWeek(days?: number[]) {
  if (!days?.length) return '—';
  return [...days]
    .sort((a, b) => a - b)
    .map((day) => WEEKDAY_LABELS[day] ?? String(day))
    .join(', ');
}

export function resolvePrescriptionTitle(
  prescriptionId?: ScheduleSummary['prescriptionId'],
) {
  if (!prescriptionId) return 'Đơn thuốc';
  if (typeof prescriptionId === 'object') {
    return prescriptionId.title?.trim() || 'Đơn thuốc';
  }
  return 'Đơn thuốc';
}

export function timeSlotsToInputString(slots: ScheduleTimeSlot[]) {
  return slots
    .map((slot) => `${slot.time.trim()}${slot.dosageNote?.trim() ? ` - ${slot.dosageNote.trim()}` : ''}`)
    .join(', ');
}

export function parseTimeSlotsInput(value: string): ScheduleTimeSlot[] {
  return value
    .split(',')
    .map((entry) => {
      const parts = entry.trim().split('-');
      return {
        time: parts[0]?.trim() || '08:00',
        dosageNote: parts.slice(1).join('-').trim() || '',
      };
    })
    .filter((slot) => slot.time);
}

export function toDateInputValue(iso?: string) {
  if (!iso) return '';
  return iso.split('T')[0];
}

type PrescriptionLike = {
  note?: string;
  medications?: Array<
    | string
    | {
        name?: string;
        dosage?: string;
        form?: string;
        usageNote?: string;
      }
  >;
};

export function buildTimeSlotsFromPrescription(prescription: PrescriptionLike) {
  const defaultTimes = ['08:00', '12:00', '20:00', '15:00', '06:00'];
  const meds = (prescription.medications ?? []).filter((item) => typeof item === 'object');

  if (!meds.length) {
    return [{ time: '08:00', dosageNote: prescription.note?.trim() || 'Theo đơn thuốc' }];
  }

  return meds.map((med, index) => {
    const parts = [med.name, med.dosage].filter(Boolean);
    const usage = formatMedicationUsage(med.usageNote);
    if (usage) {
      parts.push(usage);
    }
    return {
      time: defaultTimes[index % defaultTimes.length],
      dosageNote: parts.join(' · ') || 'Theo đơn thuốc',
    };
  });
}

export async function createScheduleApi(payload: CreateSchedulePayload, accessToken?: string) {
  const response = await scheduleApi.post<ApiEnvelope<ScheduleSummary>>(
    '/',
    {
      ...payload,
      timezone: payload.timezone ?? DEFAULT_SCHEDULE_TIMEZONE,
    },
    {
      headers: buildAuthHeaders(accessToken),
    },
  );
  return response.data;
}

export async function getSchedulesByPatientApi(
  patientId: string,
  accessToken?: string,
  params?: { page?: number; limit?: number },
) {
  const response = await scheduleApi.get<
    ApiEnvelope<{ schedules: ScheduleSummary[]; total: number; page: number; limit: number }>
  >(`/patient/${patientId}`, {
    params: { page: params?.page ?? 1, limit: params?.limit ?? 20 },
    headers: buildAuthHeaders(accessToken),
  });
  return response.data;
}

export async function getScheduleDetailApi(scheduleId: string, accessToken?: string) {
  const response = await scheduleApi.get<ApiEnvelope<ScheduleSummary>>(`/${scheduleId}`, {
    headers: buildAuthHeaders(accessToken),
  });
  return response.data;
}

export async function updateScheduleApi(
  scheduleId: string,
  payload: UpdateSchedulePayload,
  accessToken?: string,
) {
  const response = await scheduleApi.put<ApiEnvelope<ScheduleSummary>>(`/${scheduleId}`, payload, {
    headers: buildAuthHeaders(accessToken),
  });
  return response.data;
}

export async function deleteScheduleApi(scheduleId: string, accessToken?: string) {
  const response = await scheduleApi.delete<ApiEnvelope<null>>(`/${scheduleId}`, {
    headers: buildAuthHeaders(accessToken),
  });
  return response.data;
}
