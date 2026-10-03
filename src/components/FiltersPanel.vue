<template>
  <q-form @submit="onSearch">
    <div class="row q-col-gutter-md items-end">
      <div v-for="field in fields" :key="field.name" class="col-12 col-sm-6 col-md-3">
        <q-input
          v-if="field.type === 'text'"
          v-model="model[field.name]"
          :label="field.label"
          :placeholder="field.placeholder"
          outlined
          dense
          clearable
          :disable="loading"
          :rules="rulesFor(field)"
        />

        <q-select
          v-else
          v-model="model[field.name]"
          :label="field.label"
          :options="field.options ?? []"
          option-label="label"
          option-value="value"
          emit-value
          map-options
          outlined
          dense
          clearable
          :disable="loading"
          :rules="rulesFor(field)"
        />
      </div>

      <div class="col-12 col-md-auto">
        <div class="row q-gutter-sm">
          <q-btn
            type="submit"
            color="primary"
            icon="search"
            label="Buscar"
            no-caps
            :loading="loading"
            :disable="loading"
          />
          <q-btn
            flat
            color="grey-8"
            icon="clear"
            label="Limpiar"
            no-caps
            :disable="loading"
            @click="onClear"
          />
        </div>
      </div>
    </div>
  </q-form>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import type { FilterField } from './filters.types';

const props = defineProps<{ fields: FilterField[]; loading?: boolean }>();

const emit = defineEmits<{
  search: [values: Record<string, string>];
  clear: [];
}>();

const formRef = ref<{ resetValidation: () => void } | null>(null);

const model = reactive<Record<string, string | null>>({});

for (const field of props.fields) {
  model[field.name] = null;
}

function rulesFor(field: FilterField): ((value: unknown) => boolean | string)[] {
  return field.required ? [requiredRule] : [];
}

function requiredRule(value: unknown): boolean | string {
  if (value === null || value === undefined) {
    return 'Este campo es obligatorio.';
  }
  if (typeof value === 'string' && value.trim() === '') {
    return 'Este campo es obligatorio.';
  }
  return true;
}

function collectNonEmptyValues(): Record<string, string> {
  const result: Record<string, string> = {};

  for (const field of props.fields) {
    const value = model[field.name];
    if (typeof value === 'string' && value.trim() !== '') {
      result[field.name] = value;
    }
  }

  return result;
}

function onSearch(): void {
  emit('search', collectNonEmptyValues());
}

function onClear(): void {
  for (const field of props.fields) {
    model[field.name] = null;
  }
  formRef.value?.resetValidation();
  emit('clear');
}
</script>
