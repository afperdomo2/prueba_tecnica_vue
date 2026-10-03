import type { AuthSession, LoginCredentials } from '@/features/auth/types';
import type { PaymentMethod, PaymentMethodFormValues } from '@/features/payment-methods/types';

/**
 * Capa mock que simula el backend.
 *
 * Toda la data y la simulación (latencia + errores) de la API residen en este
 * único archivo. En producción, este módulo se reemplaza por un cliente HTTP
 * real; el contrato de las funciones no cambia, por lo que los stores no se
 * ven afectados.
 */

const MOCK_DELAY_MS = 800;
const MUTATION_FAILURE_PROBABILITY = 0.3;

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

const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'pm_001',
    name: 'Visa terminación 4242',
    type: 'credit_card',
    active: true,
    createdAt: '2026-01-15T10:30:00.000Z',
  },
  {
    id: 'pm_002',
    name: 'Mastercard Gold',
    type: 'credit_card',
    active: true,
    createdAt: '2026-02-03T09:15:00.000Z',
  },
  {
    id: 'pm_003',
    name: 'Tarjeta de débito principal',
    type: 'debit_card',
    active: true,
    createdAt: '2026-02-18T14:05:00.000Z',
  },
  {
    id: 'pm_004',
    name: 'Cuenta bancaria principal',
    type: 'bank_account',
    active: true,
    createdAt: '2026-03-10T11:40:00.000Z',
  },
  {
    id: 'pm_005',
    name: 'Nequi',
    type: 'digital_wallet',
    active: true,
    createdAt: '2026-04-05T16:20:00.000Z',
  },
  {
    id: 'pm_006',
    name: 'American Express',
    type: 'credit_card',
    active: false,
    createdAt: '2026-05-22T08:50:00.000Z',
  },
  {
    id: 'pm_007',
    name: 'Cuenta de ahorros',
    type: 'bank_account',
    active: false,
    createdAt: '2026-06-14T13:10:00.000Z',
  },
  {
    id: 'pm_008',
    name: 'PayPal',
    type: 'digital_wallet',
    active: true,
    createdAt: '2026-07-01T10:00:00.000Z',
  },
  {
    id: 'pm_009',
    name: 'Tarjeta de débito secundaria',
    type: 'debit_card',
    active: false,
    createdAt: '2025-08-19T17:35:00.000Z',
  },
  {
    id: 'pm_010',
    name: 'Cuenta corriente',
    type: 'bank_account',
    active: true,
    createdAt: '2025-09-27T09:45:00.000Z',
  },
  {
    id: 'pm_011',
    name: 'Visa empresa',
    type: 'credit_card',
    active: false,
    createdAt: '2025-10-11T12:25:00.000Z',
  },
  {
    id: 'pm_012',
    name: 'Apple Pay',
    type: 'digital_wallet',
    active: true,
    createdAt: '2025-11-30T15:55:00.000Z',
  },
];

export interface PaginatedResult<T> {
  items: T[];
  total: number;
}

export interface PaymentMethodsQuery {
  page: number;
  rowsPerPage: number;
  name?: string;
  type?: string;
  active?: string;
}

export async function getPaymentMethods(
  query: PaymentMethodsQuery,
): Promise<PaginatedResult<PaymentMethod>> {
  const { page, rowsPerPage, name, type, active } = query;

  let filtered = [...MOCK_PAYMENT_METHODS];

  if (name) {
    const normalizedName = name.toLowerCase();
    filtered = filtered.filter((method) => method.name.toLowerCase().includes(normalizedName));
  }

  if (type) {
    filtered = filtered.filter((method) => method.type === type);
  }

  if (active) {
    const isActive = active === 'true';
    filtered = filtered.filter((method) => method.active === isActive);
  }

  // Orden fijo del backend: fecha de creación descendente.
  const sorted = filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const total = sorted.length;
  const start = (page - 1) * rowsPerPage;
  const items = rowsPerPage === 0 ? sorted : sorted.slice(start, start + rowsPerPage);

  return simulateRequest({
    items: items.map((method) => ({ ...method })),
    total,
  });
}

export async function updatePaymentMethodStatus(
  id: string,
  active: boolean,
): Promise<PaymentMethod> {
  const method = MOCK_PAYMENT_METHODS.find((candidate) => candidate.id === id);

  if (!method) {
    return simulateFailure('Método de pago no encontrado.');
  }

  // Fallo transitorio simulado para ejercitar el manejo de errores.
  if (Math.random() < MUTATION_FAILURE_PROBABILITY) {
    return simulateFailure(
      'No se pudo actualizar el estado del método de pago. Inténtalo de nuevo.',
    );
  }

  method.active = active;
  return simulateRequest({ ...method });
}

export async function getPaymentMethodById(id: string): Promise<PaymentMethod> {
  const method = MOCK_PAYMENT_METHODS.find((candidate) => candidate.id === id);

  if (!method) {
    return simulateFailure('Método de pago no encontrado.');
  }

  return simulateRequest({ ...method });
}

export async function createPaymentMethod(values: PaymentMethodFormValues): Promise<PaymentMethod> {
  if (Math.random() < MUTATION_FAILURE_PROBABILITY) {
    return simulateFailure('No se pudo crear el método de pago. Inténtalo de nuevo.');
  }

  const method: PaymentMethod = {
    id: `pm_${String(MOCK_PAYMENT_METHODS.length + 1).padStart(3, '0')}`,
    name: values.name,
    type: values.type,
    active: true,
    createdAt: new Date().toISOString(),
    ...(values.description ? { description: values.description } : {}),
  };

  MOCK_PAYMENT_METHODS.push(method);
  return simulateRequest({ ...method });
}

export async function updatePaymentMethod(
  id: string,
  values: PaymentMethodFormValues,
): Promise<PaymentMethod> {
  const method = MOCK_PAYMENT_METHODS.find((candidate) => candidate.id === id);

  if (!method) {
    return simulateFailure('Método de pago no encontrado.');
  }

  if (Math.random() < MUTATION_FAILURE_PROBABILITY) {
    return simulateFailure('No se pudo actualizar el método de pago. Inténtalo de nuevo.');
  }

  method.name = values.name;
  method.type = values.type;

  if (values.description) {
    method.description = values.description;
  } else {
    delete method.description;
  }

  return simulateRequest({ ...method });
}

export async function deletePaymentMethod(id: string): Promise<void> {
  const index = MOCK_PAYMENT_METHODS.findIndex((candidate) => candidate.id === id);

  if (index === -1) {
    return simulateFailure('Método de pago no encontrado.');
  }

  if (Math.random() < MUTATION_FAILURE_PROBABILITY) {
    return simulateFailure('No se pudo eliminar el método de pago. Inténtalo de nuevo.');
  }

  MOCK_PAYMENT_METHODS.splice(index, 1);
  return simulateRequest<void>(undefined);
}
