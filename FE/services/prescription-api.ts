import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

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
  medications?: string[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type PrescriptionDetail = PrescriptionSummary & {
  medications?: Array<string | { _id?: string; name?: string }>;
};

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

export async function createPrescriptionApi(payload: CreatePrescriptionPayload, accessToken?: string) {
  const response = await prescriptionApi.post<ApiEnvelope<PrescriptionDetail>>('/', payload, {
    headers: buildAuthHeaders(accessToken),
  });

  return response.data;
}

export async function getPrescriptionsByPatientApi(params: GetPrescriptionsByPatientParams, accessToken?: string) {
  const response = await prescriptionApi.get<ApiEnvelope<{ prescriptions: PrescriptionSummary[]; total: number; page: number; limit: number }>>(
    `/patient/${params.patientId}`,
    {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
      },
      headers: buildAuthHeaders(accessToken),
    },
  );

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
