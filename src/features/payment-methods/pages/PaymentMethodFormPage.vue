<template>
  <q-page padding>
    <q-breadcrumbs class="q-mb-md">
      <q-breadcrumbs-el label="Métodos de pago" to="/" />
      <q-breadcrumbs-el :label="isEdit ? 'Editar' : 'Crear'" />
    </q-breadcrumbs>

    <div class="text-h5 text-primary text-weight-bold q-mb-md">
      {{ isEdit ? 'Editar método de pago' : 'Crear método de pago' }}
    </div>

    <div v-if="loading" class="row justify-center q-pa-xl">
      <q-spinner color="primary" size="3rem" />
    </div>

    <q-banner v-else-if="isEdit && !method" class="bg-negative text-white rounded-borders">
      <template #avatar>
        <q-icon name="error" />
      </template>
      No se encontró el método de pago.
      <template #action>
        <q-btn flat dense label="Volver" to="/" />
      </template>
    </q-banner>

    <q-card v-else flat bordered class="q-pa-md payment-method-form-card">
      <PaymentMethodForm
        :method="method"
        :saving="store.saving"
        @submit="onSubmit"
        @cancel="onCancel"
      />
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PaymentMethodForm from '../components/PaymentMethodForm.vue';
import { usePaymentMethodsStore } from '../stores/payment-methods.store';
import type { PaymentMethod, PaymentMethodFormValues } from '../types';

const route = useRoute();
const router = useRouter();
const store = usePaymentMethodsStore();

const id = computed(() => (typeof route.params.id === 'string' ? route.params.id : undefined));
const isEdit = computed(() => id.value !== undefined);

const loading = ref(false);
const method = ref<PaymentMethod | null>(null);

onMounted(async () => {
  if (!isEdit.value || id.value === undefined) {
    return;
  }

  loading.value = true;
  method.value = await store.fetchPaymentMethodById(id.value);
  loading.value = false;
});

async function onSubmit(values: PaymentMethodFormValues): Promise<void> {
  let success: boolean;

  if (isEdit.value && id.value !== undefined) {
    success = await store.updatePaymentMethod(id.value, values);
  } else {
    success = await store.createPaymentMethod(values);
  }

  if (success) {
    void router.push('/');
  }
}

function onCancel(): void {
  void router.push('/');
}
</script>

<style scoped>
.payment-method-form-card {
  max-width: 640px;
}
</style>
