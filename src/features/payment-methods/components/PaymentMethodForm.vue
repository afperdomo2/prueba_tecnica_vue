<template>
  <q-form @submit="onSubmit">
    <div class="row q-col-gutter-md">
      <div class="col-12 col-sm-6">
        <q-input
          v-model="form.name"
          label="Nombre"
          outlined
          dense
          autofocus
          :disable="saving"
          :rules="[requiredRule]"
        />
      </div>

      <div class="col-12 col-sm-6">
        <q-select
          v-model="form.type"
          label="Tipo"
          :options="paymentMethodTypeOptions"
          option-label="label"
          option-value="value"
          emit-value
          map-options
          outlined
          dense
          :disable="saving"
          :rules="[requiredRule]"
        />
      </div>

      <div class="col-12">
        <q-input
          v-model="form.description"
          label="Descripción"
          type="textarea"
          outlined
          dense
          autogrow
          :disable="saving"
        />
      </div>
    </div>

    <div class="row q-mt-lg q-gutter-sm">
      <q-btn
        type="submit"
        color="primary"
        icon="save"
        label="Guardar"
        no-caps
        :loading="saving"
        :disable="saving"
      />
      <q-btn
        flat
        color="grey-8"
        icon="close"
        label="Cancelar"
        no-caps
        :disable="saving"
        @click="emit('cancel')"
      />
    </div>
  </q-form>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { paymentMethodTypeOptions } from '../constants';
import type { PaymentMethod, PaymentMethodFormValues, PaymentMethodType } from '../types';

const props = defineProps<{
  method?: PaymentMethod | null;
  saving?: boolean;
}>();

const emit = defineEmits<{
  submit: [values: PaymentMethodFormValues];
  cancel: [];
}>();

const form = reactive<{
  name: string;
  type: PaymentMethodType | null;
  description: string;
}>({
  name: props.method?.name ?? '',
  type: props.method?.type ?? null,
  description: props.method?.description ?? '',
});

function requiredRule(value: unknown): boolean | string {
  if (value === null || value === undefined) {
    return 'Este campo es obligatorio.';
  }
  if (typeof value === 'string' && value.trim() === '') {
    return 'Este campo es obligatorio.';
  }
  return true;
}

function onSubmit(): void {
  if (form.type === null) {
    return;
  }

  const values: PaymentMethodFormValues = {
    name: form.name.trim(),
    type: form.type,
  };

  const description = form.description.trim();
  if (description) {
    values.description = description;
  }

  emit('submit', values);
}
</script>
