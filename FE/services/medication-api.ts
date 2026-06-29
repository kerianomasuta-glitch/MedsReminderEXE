import axios from 'axios';

import { API_BASE_URL } from '@/constants/api-config';

const medicationApi = axios.create({
  baseURL: `${API_BASE_URL}/api/v1/medications`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export type CreateMedicationPayload = {
  patientId: string;
  name: string;
  dosage: string;
  form?: string;
  unit?: string;
  usageNote?: string;
  description?: string;
};

export type GetMedicationsByPatientParams = {
  patientId: string;
  page?: number;
  limit?: number;
};

export type UpdateMedicationPayload = Partial<{
  name: string;
  dosage: string;
  form: string;
  unit: string;
  usageNote: string;
  description: string;
}>;

export type MedicationSummary = {
  _id: string;
  patientId?: string;
  createdBy?: string;
  name?: string;
  form?: string;
  dosage?: string;
  unit?: string;
  usageNote?: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

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

export async function createMedicationApi(payload: CreateMedicationPayload, accessToken?: string) {
  const response = await medicationApi.post<ApiEnvelope<MedicationSummary>>('/', payload, {
    headers: buildAuthHeaders(accessToken),
  });

  return response.data;
}

export async function getMedicationsByPatientApi(
  params: GetMedicationsByPatientParams,
  accessToken?: string,
) {
  const response = await medicationApi.get<
    ApiEnvelope<{ medications: MedicationSummary[]; total: number; page: number; limit: number }>
  >(`/patient/${params.patientId}`, {
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    },
    headers: buildAuthHeaders(accessToken),
  });

  return response.data;
}

export async function getMedicationDetailApi(medicationId: string, accessToken?: string) {
  const response = await medicationApi.get<ApiEnvelope<MedicationSummary>>(`/${medicationId}`, {
    headers: buildAuthHeaders(accessToken),
  });

  return response.data;
}

export async function updateMedicationApi(
  medicationId: string,
  payload: UpdateMedicationPayload,
  accessToken?: string,
) {
  const response = await medicationApi.put<ApiEnvelope<MedicationSummary>>(`/${medicationId}`, payload, {
    headers: buildAuthHeaders(accessToken),
  });

  return response.data;
}

export async function deleteMedicationApi(medicationId: string, accessToken?: string) {
  const response = await medicationApi.delete<ApiMessageEnvelope>(`/${medicationId}`, {
    headers: buildAuthHeaders(accessToken),
  });

  return response.data;
}