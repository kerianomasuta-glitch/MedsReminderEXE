import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import axios from 'axios';

import { loginApi, loginPatientApi, logoutApi, refreshApi, registerApi, type AuthUser } from '@/services/auth-api';

type AuthStatus = 'loading' | 'guest' | 'authenticated';
type AppRole = 'patient' | 'caregiver' | 'admin';
export type AppPortal = 'patient' | 'caregiver';

type AuthState = {
  status: AuthStatus;
  accessToken: string | null;
  refreshToken: string | null;
  deviceId: string | null;
  role: AppRole;
  portal: AppPortal | null;
  user: AuthUser | null;
};

type LoginInput =
  | {
      mode: 'caregiver';
      username: string;
      password: string;
    }
  | {
      mode: 'patient';
      caregiverPhone: string;
      authPin: string;
    };

type RegisterInput = {
  name: string;
  email: string;
  phone: string;
  password: string;
};

type AuthContextValue = AuthState & {
  login: (input: LoginInput) => Promise<{ role: AppRole }>;
  register: (input: RegisterInput) => Promise<void>;
  setPortal: (portal: AppPortal) => Promise<void>;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
};

const STORAGE_KEYS = {
  accessToken: 'auth.accessToken',
  refreshToken: 'auth.refreshToken',
  deviceId: 'auth.deviceId',
  role: 'auth.role',
  portal: 'auth.portal',
  user: 'auth.user',
} as const;

const initialState: AuthState = {
  status: 'loading',
  accessToken: null,
  refreshToken: null,
  deviceId: null,
  role: 'caregiver',
  portal: null,
  user: null,
};

const AuthContext = createContext<AuthContextValue | null>(null);

function getRoleFromUser(user: AuthUser | null | undefined): AppRole {
  const roleName = typeof user?.roleId === 'object' ? user?.roleId?.roleName : undefined;
  if (roleName === 'patient') return 'patient';
  return roleName === 'admin' ? 'admin' : 'caregiver';
}

async function persistSession(params: {
  accessToken: string;
  refreshToken: string;
  deviceId: string;
  role: AppRole;
  portal?: AppPortal | null;
  user?: AuthUser | null;
}) {
  await AsyncStorage.multiSet([
    [STORAGE_KEYS.accessToken, params.accessToken],
    [STORAGE_KEYS.refreshToken, params.refreshToken],
    [STORAGE_KEYS.deviceId, params.deviceId],
    [STORAGE_KEYS.role, params.role],
    [STORAGE_KEYS.portal, params.portal ?? ''],
    [STORAGE_KEYS.user, JSON.stringify(params.user ?? null)],
  ]);
}

async function clearSessionStorage() {
  await AsyncStorage.multiRemove([
    STORAGE_KEYS.accessToken,
    STORAGE_KEYS.refreshToken,
    STORAGE_KEYS.deviceId,
    STORAGE_KEYS.role,
    STORAGE_KEYS.portal,
    STORAGE_KEYS.user,
  ]);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState);

  const applyGuestState = useCallback(async () => {
    await clearSessionStorage();
    setState({ ...initialState, status: 'guest' });
  }, []);

  const refreshSession = useCallback(async () => {
    const entries = await AsyncStorage.multiGet([
      STORAGE_KEYS.refreshToken,
      STORAGE_KEYS.deviceId,
      STORAGE_KEYS.role,
      STORAGE_KEYS.portal,
      STORAGE_KEYS.user,
    ]);
    const map = Object.fromEntries(entries);
    const storedRefreshToken = map[STORAGE_KEYS.refreshToken];
    const storedDeviceId = map[STORAGE_KEYS.deviceId];

    if (!storedRefreshToken || !storedDeviceId) {
      await applyGuestState();
      return null;
    }

    try {
      const response = await refreshApi({
        refreshToken: storedRefreshToken,
        deviceId: storedDeviceId,
      });

      const nextRole = (map[STORAGE_KEYS.role] as AppRole) || 'caregiver';
      const nextPortal = (map[STORAGE_KEYS.portal] as AppPortal) || null;
      const nextUser = map[STORAGE_KEYS.user] ? (JSON.parse(map[STORAGE_KEYS.user] as string) as AuthUser | null) : null;

      await persistSession({
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
        deviceId: response.data.deviceId,
        role: nextRole,
        portal: nextPortal,
        user: nextUser,
      });

      setState({
        status: 'authenticated',
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
        deviceId: response.data.deviceId,
        role: nextRole,
        portal: nextPortal,
        user: nextUser,
      });
      return response.data.accessToken;
    } catch {
      await applyGuestState();
      return null;
    }
  }, [applyGuestState]);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          const newAccessToken = await refreshSession();
          if (newAccessToken) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return axios(originalRequest);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [refreshSession]);

  const login = useCallback(async (input: LoginInput) => {
    const response =
      input.mode === 'caregiver'
        ? await loginApi({
            username: input.username,
            password: input.password,
          })
        : await loginPatientApi({
            caregiverPhone: input.caregiverPhone,
            authPin: input.authPin,
          });
    const role = getRoleFromUser(response.data.user);
    const portal = role === 'patient' ? 'patient' : null;

    await persistSession({
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
      deviceId: response.data.deviceId,
      role,
      portal,
      user: response.data.user,
    });

    setState({
      status: 'authenticated',
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
      deviceId: response.data.deviceId,
      role,
      portal,
      user: response.data.user,
    });
    return { role };
  }, []);

  const setPortal = useCallback(async (portal: AppPortal) => {
    await AsyncStorage.setItem(STORAGE_KEYS.portal, portal);
    setState((prev) => ({ ...prev, portal }));
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    await registerApi(input);
  }, []);

  const logout = useCallback(async () => {
    try {
      if (state.accessToken && state.deviceId) {
        try {
          await logoutApi({
            accessToken: state.accessToken,
            deviceId: state.deviceId,
          });
        } catch {
          // Token may already be expired or invalid; still clear local session.
        }
      }
    } finally {
      await applyGuestState();
    }
  }, [applyGuestState, state.accessToken, state.deviceId]);

  const value = useMemo<AuthContextValue>(() => ({
    ...state,
    login,
    register,
    setPortal,
    refreshSession,
    logout,
  }), [state, login, register, setPortal, refreshSession, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function getDefaultRouteByRole(role: AppRole, portal: AppPortal | null) {
  if (role === 'admin') {
    return '/admin';
  }
  if (role === 'patient') {
    return '/';
  }
  return '/caregiver/dashboard';
}
