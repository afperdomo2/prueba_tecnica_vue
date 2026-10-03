import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

vi.mock('@/api/mock-backend', () => ({
  createPaymentMethod: vi.fn(),
  deletePaymentMethod: vi.fn(),
  getPaymentMethodById: vi.fn(),
  getPaymentMethods: vi.fn(),
  updatePaymentMethod: vi.fn(),
  updatePaymentMethodStatus: vi.fn(),
}));

vi.mock('quasar', () => ({
  Notify: { create: vi.fn() },
}));

import { usePaymentMethodsStore } from '@/features/payment-methods/stores/payment-methods.store';
import {
  createPaymentMethod,
  deletePaymentMethod,
  getPaymentMethodById,
  getPaymentMethods,
  updatePaymentMethod,
  updatePaymentMethodStatus,
} from '@/api/mock-backend';
import { Notify } from 'quasar';
import type { PaymentMethod, PaymentMethodFormValues } from '@/features/payment-methods/types';

const mockCreate = vi.mocked(createPaymentMethod);
const mockDelete = vi.mocked(deletePaymentMethod);
const mockFetchById = vi.mocked(getPaymentMethodById);
const mockGet = vi.mocked(getPaymentMethods);
const mockUpdate = vi.mocked(updatePaymentMethod);
const mockUpdateStatus = vi.mocked(updatePaymentMethodStatus);
const mockNotifyCreate = vi.mocked(Notify.create);

const method: PaymentMethod = {
  id: 'pm_001',
  name: 'Visa terminación 4242',
  type: 'credit_card',
  active: true,
  createdAt: '2026-01-15T10:30:00.000Z',
};

const formValues: PaymentMethodFormValues = {
  name: 'Nueva tarjeta',
  type: 'credit_card',
  description: 'Tarjeta principal',
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
    expect(mockNotifyCreate).toHaveBeenCalledWith(expect.objectContaining({ type: 'negative' }));
  });

  it('createPaymentMethod retorna true y notifica éxito', async () => {
    mockCreate.mockResolvedValue({ ...method, id: 'pm_013' });

    const store = usePaymentMethodsStore();
    const result = await store.createPaymentMethod(formValues);

    expect(result).toBe(true);
    expect(store.saving).toBe(false);
    expect(mockNotifyCreate).toHaveBeenCalledWith(expect.objectContaining({ type: 'positive' }));
  });

  it('createPaymentMethod retorna false y notifica error', async () => {
    mockCreate.mockRejectedValue(new Error('No se pudo crear.'));

    const store = usePaymentMethodsStore();
    const result = await store.createPaymentMethod(formValues);

    expect(result).toBe(false);
    expect(store.saving).toBe(false);
    expect(mockNotifyCreate).toHaveBeenCalledWith(expect.objectContaining({ type: 'negative' }));
  });

  it('updatePaymentMethod retorna true y notifica éxito', async () => {
    mockUpdate.mockResolvedValue({ ...method, name: 'Editado' });

    const store = usePaymentMethodsStore();
    const result = await store.updatePaymentMethod('pm_001', formValues);

    expect(result).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith('pm_001', formValues);
    expect(mockNotifyCreate).toHaveBeenCalledWith(expect.objectContaining({ type: 'positive' }));
  });

  it('updatePaymentMethod retorna false y notifica error', async () => {
    mockUpdate.mockRejectedValue(new Error('No se pudo actualizar.'));

    const store = usePaymentMethodsStore();
    const result = await store.updatePaymentMethod('pm_001', formValues);

    expect(result).toBe(false);
    expect(mockNotifyCreate).toHaveBeenCalledWith(expect.objectContaining({ type: 'negative' }));
  });

  it('deletePaymentMethod elimina el método y notifica éxito', async () => {
    mockGet.mockResolvedValue({ items: [{ ...method }], total: 1 });
    mockDelete.mockResolvedValue(undefined);

    const store = usePaymentMethodsStore();
    await store.fetchPaymentMethods({ page: 1, rowsPerPage: 10 });
    const result = await store.deletePaymentMethod('pm_001');

    expect(result).toBe(true);
    expect(store.items).toHaveLength(0);
    expect(store.total).toBe(0);
    expect(mockNotifyCreate).toHaveBeenCalledWith(expect.objectContaining({ type: 'positive' }));
  });

  it('deletePaymentMethod retorna false y notifica error', async () => {
    mockGet.mockResolvedValue({ items: [{ ...method }], total: 1 });
    mockDelete.mockRejectedValue(new Error('No se pudo eliminar.'));

    const store = usePaymentMethodsStore();
    await store.fetchPaymentMethods({ page: 1, rowsPerPage: 10 });
    const result = await store.deletePaymentMethod('pm_001');

    expect(result).toBe(false);
    expect(store.items).toHaveLength(1);
    expect(mockNotifyCreate).toHaveBeenCalledWith(expect.objectContaining({ type: 'negative' }));
  });

  it('fetchPaymentMethodById devuelve el método', async () => {
    mockFetchById.mockResolvedValue(method);

    const store = usePaymentMethodsStore();
    const result = await store.fetchPaymentMethodById('pm_001');

    expect(result).toEqual(method);
  });

  it('fetchPaymentMethodById devuelve null y notifica error', async () => {
    mockFetchById.mockRejectedValue(new Error('No encontrado.'));

    const store = usePaymentMethodsStore();
    const result = await store.fetchPaymentMethodById('pm_999');

    expect(result).toBeNull();
    expect(mockNotifyCreate).toHaveBeenCalledWith(expect.objectContaining({ type: 'negative' }));
  });

  it('togglePaymentMethod actualiza de forma optimista y persiste', async () => {
    mockGet.mockResolvedValue({ items: [{ ...method }], total: 1 });
    mockUpdateStatus.mockResolvedValue({ ...method, active: false });

    const store = usePaymentMethodsStore();
    await store.fetchPaymentMethods({ page: 1, rowsPerPage: 10 });

    const promise = store.togglePaymentMethod('pm_001');

    expect(store.items[0]?.active).toBe(false);
    expect(store.isUpdating('pm_001')).toBe(true);

    await promise;

    expect(mockUpdateStatus).toHaveBeenCalledWith('pm_001', false);
    expect(store.isUpdating('pm_001')).toBe(false);
  });

  it('togglePaymentMethod revierte si el mock falla', async () => {
    mockGet.mockResolvedValue({ items: [{ ...method }], total: 1 });
    mockUpdateStatus.mockRejectedValue(new Error('No se pudo actualizar.'));

    const store = usePaymentMethodsStore();
    await store.fetchPaymentMethods({ page: 1, rowsPerPage: 10 });

    await store.togglePaymentMethod('pm_001');

    expect(store.items[0]?.active).toBe(true);
    expect(store.isUpdating('pm_001')).toBe(false);
    expect(mockNotifyCreate).toHaveBeenCalledWith(expect.objectContaining({ type: 'negative' }));
  });
});
