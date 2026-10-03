import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

vi.mock('@/api/mock-backend', () => ({
  getPaymentMethods: vi.fn(),
  updatePaymentMethodStatus: vi.fn(),
}));

vi.mock('quasar', () => ({
  Notify: { create: vi.fn() },
}));

import { usePaymentMethodsStore } from '@/features/payment-methods/stores/payment-methods.store';
import { getPaymentMethods, updatePaymentMethodStatus } from '@/api/mock-backend';
import { Notify } from 'quasar';
import type { PaymentMethod } from '@/features/payment-methods/types';

const mockGet = vi.mocked(getPaymentMethods);
const mockUpdate = vi.mocked(updatePaymentMethodStatus);
const mockNotifyCreate = vi.mocked(Notify.create);

const method: PaymentMethod = {
  id: 'pm_001',
  name: 'Visa terminación 4242',
  type: 'credit_card',
  active: true,
  createdAt: '2024-01-15T10:30:00.000Z',
};

describe('payment methods store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('fetchPaymentMethods carga los ítems de la página y el total', async () => {
    mockGet.mockResolvedValue({ items: [method], total: 12 });

    const store = usePaymentMethodsStore();
    await store.fetchPaymentMethods({ page: 1, rowsPerPage: 10 });

    expect(store.status).toBe('success');
    expect(store.items).toEqual([method]);
    expect(store.total).toBe(12);
    expect(mockNotifyCreate).not.toHaveBeenCalled();
  });

  it('fetchPaymentMethods maneja el error y notifica', async () => {
    mockGet.mockRejectedValue(new Error('Fallo al cargar.'));

    const store = usePaymentMethodsStore();
    await store.fetchPaymentMethods({ page: 1, rowsPerPage: 10 });

    expect(store.status).toBe('error');
    expect(store.error).toBe('Fallo al cargar.');
    expect(mockNotifyCreate).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'negative' }),
    );
  });

  it('togglePaymentMethod actualiza de forma optimista y persiste', async () => {
    mockGet.mockResolvedValue({ items: [{ ...method }], total: 1 });
    mockUpdate.mockResolvedValue({ ...method, active: false });

    const store = usePaymentMethodsStore();
    await store.fetchPaymentMethods({ page: 1, rowsPerPage: 10 });

    const promise = store.togglePaymentMethod('pm_001');

    // Optimista: ya volteó antes de que resuelva el mock
    expect(store.items[0]?.active).toBe(false);
    expect(store.isUpdating('pm_001')).toBe(true);

    await promise;

    expect(mockUpdate).toHaveBeenCalledWith('pm_001', false);
    expect(store.isUpdating('pm_001')).toBe(false);
  });

  it('togglePaymentMethod revierte si el mock falla', async () => {
    mockGet.mockResolvedValue({ items: [{ ...method }], total: 1 });
    mockUpdate.mockRejectedValue(new Error('No se pudo actualizar.'));

    const store = usePaymentMethodsStore();
    await store.fetchPaymentMethods({ page: 1, rowsPerPage: 10 });

    await store.togglePaymentMethod('pm_001');

    expect(store.items[0]?.active).toBe(true);
    expect(store.isUpdating('pm_001')).toBe(false);
    expect(mockNotifyCreate).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'negative' }),
    );
  });
});
