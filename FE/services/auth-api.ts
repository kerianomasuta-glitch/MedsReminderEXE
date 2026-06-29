import { API_BASE_URL } from '@/constants/api-config';

export class AuthRequestError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'AuthRequestError';
    this.statusCode = statusCode;
  }
}

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

function mapCaregiverLoginError(statusCode: number): string {
  if (statusCode === 401 || statusCode === 403 || statusCode === 400) {
    return 'Sai tài khoản hoặc mật khẩu';
  }
  if (statusCode >= 500) {
    return 'Không thể kết nối máy chủ. Vui lòng thử lại sau.';
  }
  return 'Đăng nhập thất bại';
}

function mapPatientLoginError(statusCode: number): string {
  if (statusCode === 401 || statusCode === 403 || statusCode === 400) {
    return 'Số điện thoại người thân hoặc mã PIN không đúng';
  }
  if (statusCode >= 500) {
    return 'Không thể kết nối máy chủ. Vui lòng thử lại sau.';
  }
  return 'Đăng nhập thất bại';
}

export type LoginApiResult =
  | { ok: true; data: AuthTokensPayload }
  | { ok: false; message: string };

async function requestJson<T>(path: string, init: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init.headers ?? {}),
      },
      credentials: 'include',
    });
  } catch {
    throw new Error('Không thể kết nối máy chủ. Vui lòng kiểm tra mạng và thử lại.');
  }

  let json: { message?: string } | null = null;
  try {
    json = await res.json();
  } catch {
    if (!res.ok) {
      throw new AuthRequestError('Request failed', res.status);
    }
    throw new Error('Phản hồi từ máy chủ không hợp lệ.');
  }

  if (!res.ok) {
    throw new AuthRequestError(json?.message ?? 'Request failed', res.status);
  }

  return json as T;
}

export async function loginApi(params: { username: string; password: string }): Promise<LoginApiResult> {
  const { username, password } = params;
  const payload = username.includes('@') ? { email: username, password } : { phone: username, password };

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
  } catch {
    return { ok: false, message: 'Không thể kết nối máy chủ. Vui lòng kiểm tra mạng và thử lại.' };
  }

  let json: { data?: AuthTokensPayload } | null = null;
  try {
    json = await res.json();
  } catch {
    return { ok: false, message: mapCaregiverLoginError(res.status) };
  }

  if (!res.ok || !json?.data) {
    return { ok: false, message: mapCaregiverLoginError(res.status) };
  }

  return { ok: true, data: json.data };
}

export async function loginPatientApi(params: { caregiverPhone: string; authPin: string }): Promise<LoginApiResult> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/api/v1/auth/patient-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(params),
    });
  } catch {
    return { ok: false, message: 'Không thể kết nối máy chủ. Vui lòng kiểm tra mạng và thử lại.' };
  }

  let json: { data?: AuthTokensPayload } | null = null;
  try {
    json = await res.json();
  } catch {
    return { ok: false, message: mapPatientLoginError(res.status) };
  }

  if (!res.ok || !json?.data) {
    return { ok: false, message: mapPatientLoginError(res.status) };
  }

  return { ok: true, data: json.data };
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
