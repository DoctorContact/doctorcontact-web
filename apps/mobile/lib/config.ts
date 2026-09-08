import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Mobile Environment & Network Configuration.
 * Centralized resolution of API and Socket URLs with platform fallbacks.
 */

const API_PORT = 8000;

/**
 * The LAN host the Metro/Expo dev server is being served from, e.g. "192.168.1.13"
 * (from `192.168.1.13:8081`). On a physical device this is the only host that can
 * reach the dev machine — `localhost` and the emulator alias `10.0.2.2` do not.
 */
function getDevServerHost(): string | null {
  const c = Constants as any;
  const hostUri =
    c.expoConfig?.hostUri ||
    c.expoGoConfig?.debuggerHost ||
    c.manifest?.debuggerHost ||
    c.manifest2?.extra?.expoGo?.debuggerHost ||
    '';

  const host = String(hostUri).split(':')[0].trim();
  if (!host || host === 'localhost' || host === '127.0.0.1') return null;
  return host;
}

function getDevApiUrl(): string {
  const host = getDevServerHost();
  if (host) return `http://${host}:${API_PORT}/api/v1`;
  // Fallbacks: Android emulator -> host alias; everything else -> localhost.
  if (Platform.OS === 'android') return `http://10.0.2.2:${API_PORT}/api/v1`;
  return `http://localhost:${API_PORT}/api/v1`;
}

function getDevSocketUrl(): string {
  const host = getDevServerHost();
  if (host) return `http://${host}:${API_PORT}`;
  if (Platform.OS === 'android') return `http://10.0.2.2:${API_PORT}`;
  return `http://localhost:${API_PORT}`;
}

export const Config = {
  API_URL:
    process.env.EXPO_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    getDevApiUrl(),
  SOCKET_URL:
    process.env.EXPO_PUBLIC_SOCKET_URL ||
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    getDevSocketUrl(),
  APP_NAME: 'Dewasi Group',
  TOKEN_KEY: 'dewasi_access_token',
  REFRESH_TOKEN_KEY: 'dewasi_refresh_token',
  USER_KEY: 'dewasi_auth_user',
} as const;
