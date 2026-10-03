import { computed, ref } from 'vue';
import { acceptHMRUpdate, defineStore } from 'pinia';
import { Notify } from 'quasar';
import { login as loginRequest } from '@/api/mock-backend';
import type { AuthUser, LoginCredentials } from '../types';

const TOKEN_STORAGE_KEY = 'auth.token';
const USER_STORAGE_KEY = 'auth.user';

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'error';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null);
  const user = ref<AuthUser | null>(null);
  const status = ref<AuthStatus>('idle');

  const isAuthenticated = computed(() => token.value !== null);

  function persistSession(session: { token: string; user: AuthUser }): void {
    localStorage.setItem(TOKEN_STORAGE_KEY, session.token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(session.user));
  }

  function clearSession(): void {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  }

  function restoreSession(): void {
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);

    if (!storedToken || !storedUser) {
      return;
    }

    try {
      token.value = storedToken;
      user.value = JSON.parse(storedUser) as AuthUser;
      status.value = 'authenticated';
    } catch {
      clearSession();
    }
  }

  async function login(credentials: LoginCredentials): Promise<boolean> {
    status.value = 'loading';

    try {
      const session = await loginRequest(credentials);

      token.value = session.token;
      user.value = session.user;
      persistSession(session);
      status.value = 'authenticated';

      return true;
    } catch (error) {
      status.value = 'error';

      const message =
        error instanceof Error ? error.message : 'Error inesperado al iniciar sesión.';

      Notify.create({
        type: 'negative',
        message,
        position: 'top',
      });

      return false;
    }
  }

  function logout(): void {
    token.value = null;
    user.value = null;
    status.value = 'idle';
    clearSession();
  }

  return {
    token,
    user,
    status,
    isAuthenticated,
    restoreSession,
    login,
    logout,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot));
}
