<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="confirm-delete-dialog">
      <q-card-section>
        <div class="text-h6">Eliminar método de pago</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        ¿Seguro que deseas eliminar <strong>{{ name }}</strong
        >?
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancelar" no-caps :disable="loading" @click="onDialogCancel" />
        <q-btn
          color="negative"
          icon="delete"
          label="Eliminar"
          no-caps
          :loading="loading"
          :disable="loading"
          @click="onDelete"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useDialogPluginComponent } from 'quasar';
import { usePaymentMethodsStore } from '@/features/payment-methods/stores/payment-methods.store';

const props = defineProps<{
  id: string;
  name: string;
}>();

defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

const store = usePaymentMethodsStore();
const loading = ref(false);

async function onDelete(): Promise<void> {
  loading.value = true;

  const success = await store.deletePaymentMethod(props.id);

  if (success) {
    onDialogOK();
  } else {
    loading.value = false;
  }
}
</script>

<style scoped>
.confirm-delete-dialog {
  min-width: 320px;
  max-width: 90vw;
}
</style>
