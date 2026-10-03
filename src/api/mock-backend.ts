import type { AuthSession, LoginCredentials } from '@/features/auth/types';

/**
 * Capa mock que simula el backend.
 *
 * Toda la data y la simulación (latencia + errores) de la API residen en este
 * único archivo. En producción, este módulo se reemplaza por un cliente HTTP
 * real; el contrato de las funciones no cambia, por lo que los stores no se
 * ven afectados.
 */

const MOCK_DELAY_MS = 800;

interface MockUser {
  username: string;
  password: string;
  token: string;
  user: AuthSession['user'];
}

const MOCK_USERS: MockUser[] = [
  {
    username: 'admin',
    password: 'admin123',
    token: 'mock-jwt-token-admin',
    user: {
      id: 'usr_001',
      name: 'Administrador',
      email: 'admin@quasar.dev',
    },
  },
];

function simulateRequest<T>(data: T, delayMs: number = MOCK_DELAY_MS): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delayMs);
  });
}

function simulateFailure(message: string, delayMs: number = MOCK_DELAY_MS): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), delayMs);
  });
}

export async function login(credentials: LoginCredentials): Promise<AuthSession> {
  const found = MOCK_USERS.find(
    (candidate) =>
      candidate.username === credentials.username && candidate.password === credentials.password,
  );

  if (!found) {
    return simulateFailure('Credenciales incorrectas. Verifica tus datos.');
  }

  return simulateRequest({
    token: found.token,
    user: found.user,
  });
}
