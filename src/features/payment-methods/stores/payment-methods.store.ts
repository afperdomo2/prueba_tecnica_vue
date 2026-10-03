import { computed, ref } from 'vue';
import { acceptHMRUpdate, defineStore } from 'pinia';
import { Notify } from 'quasar';
import { getPaymentMethods, updatePaymentMethodStatus } from '@/api/mock-backend';
import type { PaymentMethodsQuery } from '@/api/mock-backend';
import type { PaymentMethod } from '../types';

export type PaymentMethodsStatus = 'idle' | 'loading' | 'success' | 'error';

export const usePaymentMethodsStore = defineStore('payment-methods', () => {
  const items = ref<PaymentMethod[]>([]);
  const total = ref(0);
  const status = ref<PaymentMethodsStatus>('idle');
  const error = ref<string | null>(null);
  const updatingIds = ref<string[]>([]);

  const isLoading = computed(() => status.value === 'loading');

  function isUpdating(id: string): boolean {
    return updatingIds.value.includes(id);
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
      error.value = err instanceof Error ? err.message : 'Error al cargar los métodos de pago.';

      Notify.create({
        type: 'negative',
        message: error.value,
        position: 'top',
      });
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

      const message = err instanceof Error ? err.message : 'Error al actualizar el método de pago.';

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
    isLoading,
    isUpdating,
    fetchPaymentMethods,
    togglePaymentMethod,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePaymentMethodsStore, import.meta.hot));
}
