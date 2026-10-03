import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

vi.mock('@/api/mock-backend', () => ({
  login: vi.fn(),
}));

vi.mock('quasar', () => ({
  Notify: { create: vi.fn() },
}));

import { useAuthStore } from '@/features/auth/stores/auth.store';
import { login as loginRequest } from '@/api/mock-backend';
import { Notify } from 'quasar';

const mockLogin = vi.mocked(loginRequest);
const mockNotifyCreate = vi.mocked(Notify.create);

const user = { id: 'usr_001', name: 'Administrador', email: 'admin@quasar.dev' };

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('login exitoso: persiste sesión y queda autenticado', async () => {
    mockLogin.mockResolvedValue({ token: 'tok', user });

    const store = useAuthStore();
    const result = await store.login({ username: 'admin', password: 'admin123' });

    expect(result).toBe(true);
    expect(store.isAuthenticated).toBe(true);
    expect(store.user).toEqual(user);
    expect(localStorage.getItem('auth.token')).toBe('tok');
    expect(mockNotifyCreate).not.toHaveBeenCalled();
  });

  it('login fallido: dispara Notify y no autentica', async () => {
    mockLogin.mockRejectedValue(new Error('Credenciales incorrectas.'));

    const store = useAuthStore();
    const result = await store.login({ username: 'admin', password: 'mal' });

    expect(result).toBe(false);
    expect(store.isAuthenticated).toBe(false);
    expect(store.status).toBe('error');
    expect(mockNotifyCreate).toHaveBeenCalledWith(expect.objectContaining({ type: 'negative' }));
  });

  it('logout limpia sesión y estado', async () => {
    mockLogin.mockResolvedValue({ token: 'tok', user });
    const store = useAuthStore();
    await store.login({ username: 'admin', password: 'admin123' });

    store.logout();

    expect(store.isAuthenticated).toBe(false);
    expect(store.token).toBeNull();
    expect(localStorage.getItem('auth.token')).toBeNull();
  });

  it('restoreSession hidrata la sesión desde localStorage', () => {
    localStorage.setItem('auth.token', 'tok');
    localStorage.setItem('auth.user', JSON.stringify(user));

    const store = useAuthStore();
    store.restoreSession();

    expect(store.isAuthenticated).toBe(true);
    expect(store.user).toEqual(user);
  });
});
