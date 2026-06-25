const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export type AuthUser = {
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
  birthday?: string;
  gender?: 'male' | 'female' | 'other';
  isActive?: boolean;
  roleId?: { roleName?: string } | string;
};

export type AuthTokensPayload = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  deviceId: string;
};

export type PatientProfileInput = {
  name: string;
  authPin: string;
  birthday?: string;
  gender?: 'male' | 'female' | 'other';
};

async function requestJson<T>(path: string, init: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
    credentials: 'include',
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.message ?? 'Request failed');
  }

  return json as T;
}

export async function loginApi(params: { username: string; password: string }) {
  const { username, password } = params;
  const payload = username.includes('@') ? { email: username, password } : { phone: username, password };

  return requestJson<{ status: string; message: string; data: AuthTokensPayload }>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function loginPatientApi(params: { caregiverPhone: string; authPin: string }) {
  return requestJson<{ status: string; message: string; data: AuthTokensPayload }>('/api/v1/auth/patient-login', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function registerApi(params: { name: string; email: string; phone: string; password: string }) {
  return requestJson<{ status: string; message: string; data: AuthUser }>('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function refreshApi(params: { refreshToken: string; deviceId: string }) {
  return requestJson<{ status: string; message: string; data: Omit<AuthTokensPayload, 'user'> }>('/api/v1/auth/refresh', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function logoutApi(params: { accessToken: string; deviceId: string }) {
  return requestJson<{ status: string; message: string }>('/api/v1/auth/logout', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
    },
    body: JSON.stringify({ deviceId: params.deviceId }),
  });
}

export async function getMyPatientsApi(params: { accessToken: string }) {
  return requestJson<{ status: string; message: string; data: Array<{ mappingId: string; linkedAt: string; patient: AuthUser }> }>(
    '/api/v1/patients',
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${params.accessToken}`,
      },
    },
  );
}

export async function createPatientApi(params: { accessToken: string; payload: PatientProfileInput }) {
  return requestJson<{
    status: string;
    message: string;
    data: {
      patient: AuthUser;
      loginFields: { caregiverPhone?: string; authPin: string };
    };
  }>('/api/v1/patients', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
    },
    body: JSON.stringify(params.payload),
  });
}
