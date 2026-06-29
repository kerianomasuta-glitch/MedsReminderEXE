import axios from 'axios';

import { API_BASE_URL } from '@/constants/api-config';

const prescriptionApi = axios.create({
  baseURL: `${API_BASE_URL}/api/v1/prescriptions`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export type CreatePrescriptionPayload = {
  patientId: string;
  title?: string;
  medications: string[];
  startDate?: string;
  endDate?: string;
  prescribedAt?: string;
  doctorName?: string;
  note?: string;
};

export type GetPrescriptionsByPatientParams = {
  patientId: string;
  page?: number;
  limit?: number;
};

export type PrescriptionMedicationRef = {
  _id: string;
  name?: string;
  dosage?: string;
  form?: string;
  unit?: string;
  usageNote?: string;
};

export type PrescriptionSummary = {
  _id: string;
  patientId?: string;
  createdBy?: string;
  title?: string;
  prescribedAt?: string;
  startDate?: string;
  endDate?: string;
  doctorName?: string;
  note?: string;
  medications?: Array<string | PrescriptionMedicationRef>;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type PrescriptionDetail = PrescriptionSummary;

export type UpdatePrescriptionPayload = Partial<{
  title: string;
  medications: string[];
  startDate: string;
  endDate: string;
  prescribedAt: string;
  doctorName: string;
  note: string;
  isActive: boolean;
}>;

type ApiEnvelope<T> = {
  status: string;
  message: string;
  data: T;
};

type ApiMessageEnvelope = {
  status: string;
  message: string;
};

function buildAuthHeaders(accessToken?: string) {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;
}

export function getPrescriptionErrorMessage(error: unknown) {
  if (axios.isAxiosError(error) && error.response?.data?.message) {
    return String(error.response.data.message);
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Có lỗi xảy ra';
}

export function formatPrescriptionMedications(medications?: PrescriptionSummary['medications']) {
  if (!medications?.length) {
    return 'Chưa có thuốc';
  }

  return medications
    .map((item) => {
      if (typeof item === 'string') return item;
      const dosage = item.dosage ? ` (${item.dosage})` : '';
      return `${item.name ?? 'Thuốc'}${dosage}`;
    })
    .join(', ');
}

function formatDateLabel(value?: string) {
  if (!value) return null;
  return new Date(value).toLocaleDateString('vi-VN');
}

export function formatPrescriptionPeriod(prescription: Pick<PrescriptionSummary, 'startDate' | 'endDate'>) {
  const start = formatDateLabel(prescription.startDate);
  const end = formatDateLabel(prescription.endDate);

  if (start && end) return `${start} → ${end}`;
  if (start) return `Từ ${start}`;
  if (end) return `Đến ${end}`;
  return null;
}

export async function createPrescriptionApi(payload: CreatePrescriptionPayload, accessToken?: string) {
  const response = await prescriptionApi.post<ApiEnvelope<PrescriptionDetail>>('/', payload, {
    headers: buildAuthHeaders(accessToken),
  });

  return response.data;
}

export async function getPrescriptionsByPatientApi(params: GetPrescriptionsByPatientParams, accessToken?: string) {
  const response = await prescriptionApi.get<
    ApiEnvelope<{ prescriptions: PrescriptionSummary[]; total: number; page: number; limit: number }>
  >(`/patient/${params.patientId}`, {
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    },
    headers: buildAuthHeaders(accessToken),
  });

  return response.data;
}

export async function getPrescriptionDetailApi(prescriptionId: string, accessToken?: string) {
  const response = await prescriptionApi.get<ApiEnvelope<PrescriptionDetail>>(`/${prescriptionId}`, {
    headers: buildAuthHeaders(accessToken),
  });

  return response.data;
}

export async function updatePrescriptionApi(
  prescriptionId: string,
  payload: UpdatePrescriptionPayload,
  accessToken?: string,
) {
  const response = await prescriptionApi.put<ApiEnvelope<PrescriptionDetail>>(`/${prescriptionId}`, payload, {
    headers: buildAuthHeaders(accessToken),
  });

  return response.data;
}

export async function deletePrescriptionApi(prescriptionId: string, accessToken?: string) {
  const response = await prescriptionApi.delete<ApiMessageEnvelope>(`/${prescriptionId}`, {
    headers: buildAuthHeaders(accessToken),
  });

  return response.data;
}
