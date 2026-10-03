import { computed, ref } from 'vue';
import { acceptHMRUpdate, defineStore } from 'pinia';
import { Notify } from 'quasar';
import {
  createPaymentMethod as createPaymentMethodRequest,
  getPaymentMethodById as fetchPaymentMethodByIdRequest,
  getPaymentMethods,
  updatePaymentMethod as updatePaymentMethodRequest,
  updatePaymentMethodStatus,
} from '@/api/mock-backend';
import type { PaymentMethodsQuery } from '@/api/mock-backend';
import type { PaymentMethod, PaymentMethodFormValues } from '../types';

export type PaymentMethodsStatus = 'idle' | 'loading' | 'success' | 'error';

export const usePaymentMethodsStore = defineStore('payment-methods', () => {
  const items = ref<PaymentMethod[]>([]);
  const total = ref(0);
  const status = ref<PaymentMethodsStatus>('idle');
  const error = ref<string | null>(null);
  const updatingIds = ref<string[]>([]);
  const saving = ref(false);

  const isLoading = computed(() => status.value === 'loading');

  function isUpdating(id: string): boolean {
    return updatingIds.value.includes(id);
  }

  function errorMessage(err: unknown, fallback: string): string {
    return err instanceof Error ? err.message : fallback;
  }

  async function fetchPaymentMethods(query: PaymentMethodsQuery): Promise<void> {
    status.value = 'loading';
    error.value = null;

    try {
      const result = await getPaymentMethods(query);
      items.value = result.items;
      total.value = result.total;
      status.value = 'success';
    } catch (err) {
      status.value = 'error';
      error.value = errorMessage(err, 'Error al cargar los métodos de pago.');

      Notify.create({
        type: 'negative',
        message: error.value,
        position: 'top',
      });
    }
  }

  async function fetchPaymentMethodById(id: string): Promise<PaymentMethod | null> {
    try {
      return await fetchPaymentMethodByIdRequest(id);
    } catch (err) {
      const message = errorMessage(err, 'Error al cargar el método de pago.');

      Notify.create({
        type: 'negative',
        message,
        position: 'top',
      });

      return null;
    }
  }

  async function createPaymentMethod(values: PaymentMethodFormValues): Promise<boolean> {
    saving.value = true;

    try {
      await createPaymentMethodRequest(values);
      saving.value = false;
      Notify.create({ type: 'positive', message: 'Método de pago creado.' });
      return true;
    } catch (err) {
      saving.value = false;
      const message = errorMessage(err, 'Error al crear el método de pago.');

      Notify.create({
        type: 'negative',
        message,
        position: 'top',
      });

      return false;
    }
  }

  async function updatePaymentMethod(
    id: string,
    values: PaymentMethodFormValues,
  ): Promise<boolean> {
    saving.value = true;

    try {
      await updatePaymentMethodRequest(id, values);
      saving.value = false;
      Notify.create({ type: 'positive', message: 'Método de pago actualizado.' });
      return true;
    } catch (err) {
      saving.value = false;
      const message = errorMessage(err, 'Error al actualizar el método de pago.');

      Notify.create({
        type: 'negative',
        message,
        position: 'top',
      });

      return false;
    }
  }

  async function togglePaymentMethod(id: string): Promise<void> {
    const method = items.value.find((candidate) => candidate.id === id);

    if (!method || isUpdating(id)) {
      return;
    }

    const previousActive = method.active;
    method.active = !previousActive;
    updatingIds.value.push(id);

    try {
      await updatePaymentMethodStatus(id, method.active);
    } catch (err) {
      method.active = previousActive;

      const message = errorMessage(err, 'Error al actualizar el método de pago.');

      Notify.create({
        type: 'negative',
        message,
        position: 'top',
      });
    } finally {
      updatingIds.value = updatingIds.value.filter((item) => item !== id);
    }
  }

  return {
    items,
    total,
    status,
    error,
    updatingIds,
    saving,
    isLoading,
    isUpdating,
    fetchPaymentMethods,
    fetchPaymentMethodById,
    createPaymentMethod,
    updatePaymentMethod,
    togglePaymentMethod,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePaymentMethodsStore, import.meta.hot));
}
