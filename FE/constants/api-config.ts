import Constants from 'expo-constants';
import { Platform } from 'react-native';

const DEFAULT_PORT = 3000;

function resolveDevHost(): string | null {
  if (Platform.OS === 'web') {
    return null;
  }

  const candidates = [Constants.expoConfig?.hostUri, Constants.expoGoConfig?.debuggerHost];

  for (const value of candidates) {
    if (!value) continue;
    const host = value.split(':')[0]?.trim();
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return host;
    }
  }

  return null;
}

/** URL backend — ưu tiên EXPO_PUBLIC_API_URL, dev trên điện thoại dùng IP máy tính chạy Expo. */
export function getApiBaseUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/$/, '');
  if (configured) {
    return configured;
  }

  if (__DEV__) {
    const devHost = resolveDevHost();
    if (devHost) {
      return `http://${devHost}:${DEFAULT_PORT}`;
    }
    if (Platform.OS === 'android') {
      return `http://10.0.2.2:${DEFAULT_PORT}`;
    }
  }

  return `http://localhost:${DEFAULT_PORT}`;
}

export const API_BASE_URL = getApiBaseUrl();

if (__DEV__) {
  console.log('[MedsReminder] API base URL:', API_BASE_URL);
}
