<template>
  <q-page padding>
    <div class="row items-center q-mb-md">
      <div class="text-h5 text-primary text-weight-bold">Métodos de pago</div>
      <q-space />
      <q-btn color="primary" icon="add" label="Nuevo" no-caps to="/payment-methods/new" />
    </div>

    <FiltersPanel
      class="q-mb-md"
      :fields="filterFields"
      :loading="store.isLoading"
      @search="onSearch"
      @clear="onClear"
    />

    <!-- Skeleton mientras carga -->
    <q-card
      v-if="store.isLoading"
      flat
      bordered
      aria-busy="true"
      aria-label="Cargando métodos de pago"
    >
      <!-- Header -->
      <div class="pm-skeleton-row row items-center q-px-md">
        <div class="col"><q-skeleton type="text" width="60%" /></div>
        <div class="col"><q-skeleton type="text" width="50%" class="q-mx-auto" /></div>
        <div class="col">
          <q-skeleton type="rect" width="40px" height="20px" class="q-mx-auto" />
        </div>
        <div class="col"><q-skeleton type="text" width="60%" class="q-mx-auto" /></div>
        <div class="col"><q-skeleton type="text" width="50%" class="q-mx-auto" /></div>
      </div>

      <!-- Body -->
      <div v-for="row in skeletonRows" :key="row" class="pm-skeleton-row row items-center q-px-md">
        <div class="col"><q-skeleton type="text" /></div>
        <div class="col"><q-skeleton type="text" width="50%" class="q-mx-auto" /></div>
        <div class="col">
          <q-skeleton type="rect" width="40px" height="20px" class="q-mx-auto" />
        </div>
        <div class="col"><q-skeleton type="text" width="60%" class="q-mx-auto" /></div>
        <div class="col">
          <div class="row justify-center q-gutter-xs">
            <q-skeleton type="circle" size="24px" />
            <q-skeleton type="circle" size="24px" />
          </div>
        </div>
      </div>

      <!-- Footer (paginación) -->
      <div class="pm-skeleton-footer row items-center justify-between q-px-md">
        <q-skeleton type="text" width="220px" />
        <q-skeleton type="rect" width="120px" height="24px" />
      </div>
    </q-card>

    <!-- Error -->
    <q-banner v-else-if="store.status === 'error'" class="bg-negative text-white rounded-borders">
      <template #avatar>
        <q-icon name="error" />
      </template>
      {{ store.error }}
      <template #action>
        <q-btn flat dense label="Reintentar" @click="reload()" />
      </template>
    </q-banner>

    <!-- Tabla -->
    <q-table
      v-else
      flat
      bordered
      :rows="store.items"
      :columns="columns"
      row-key="id"
      v-model:pagination="pagination"
      :rows-per-page-options="[10, 20, 50]"
      @request="onRequest"
    >
      <template #body-cell-name="props">
        <q-td :props="props">
          <span class="text-weight-medium">{{ props.row.name }}</span>
        </q-td>
      </template>

      <template #body-cell-type="props">
        <q-td :props="props">
          <q-icon :name="typeMeta(props.row.type).icon" class="q-mr-sm text-grey-7" />
          <span>{{ typeMeta(props.row.type).label }}</span>
        </q-td>
      </template>

      <template #body-cell-active="props">
        <q-td :props="props">
          <span class="cursor-help">
            <q-toggle
              :model-value="props.row.active"
              :disable="store.isUpdating(props.row.id)"
              color="positive"
              @update:model-value="store.togglePaymentMethod(props.row.id)"
            />
            <q-tooltip>{{ props.row.active ? 'Inactivar' : 'Activar' }}</q-tooltip>
          </span>
          <q-badge
            class="q-ml-sm"
            :color="props.row.active ? 'positive' : 'grey-6'"
            :label="props.row.active ? 'Activo' : 'Inactivo'"
          />
        </q-td>
      </template>

      <template #body-cell-createdAt="props">
        <q-td :props="props">
          <span class="cursor-default">
            {{ formatDateShort(props.row.createdAt) }}
            <q-tooltip>{{ formatDateTime(props.row.createdAt) }}</q-tooltip>
          </span>
        </q-td>
      </template>

      <template #body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            flat
            round
            dense
            color="primary"
            icon="edit"
            aria-label="Editar"
            :to="{ name: 'payment-method-edit', params: { id: props.row.id } }"
          >
            <q-tooltip>Editar</q-tooltip>
          </q-btn>

          <q-btn
            flat
            round
            dense
            color="negative"
            icon="delete"
            aria-label="Eliminar"
            @click="onDelete(props.row)"
          >
            <q-tooltip>Eliminar</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Dialog } from 'quasar';
import type { QTableColumn, QTableProps } from 'quasar';
import FiltersPanel from '@/components/FiltersPanel.vue';
import type { FilterField } from '@/components/filters.types';
import ConfirmDeleteDialog from '../components/ConfirmDeleteDialog.vue';
import { usePaymentMethodsStore } from '../stores/payment-methods.store';
import {
  paymentMethodActiveOptions,
  paymentMethodTypeMeta,
  paymentMethodTypeOptions,
} from '../constants';
import { formatDateShort, formatDateTime } from '@/utils/date';
import type { PaymentMethod, PaymentMethodType } from '../types';

const DEFAULT_ROWS_PER_PAGE = 10;

const route = useRoute();
const router = useRouter();
const store = usePaymentMethodsStore();

const pagination = ref({
  page: 1,
  rowsPerPage: DEFAULT_ROWS_PER_PAGE,
  rowsNumber: 0,
});

const filterFields: FilterField[] = [
  { name: 'name', label: 'Nombre', type: 'text' },
  { name: 'type', label: 'Tipo', type: 'select', options: paymentMethodTypeOptions },
  { name: 'active', label: 'Estado', type: 'select', options: paymentMethodActiveOptions },
];

const columns: QTableColumn[] = [
  { name: 'name', label: 'Nombre', field: 'name', align: 'left' },
  { name: 'type', label: 'Tipo', field: 'type', align: 'center' },
  { name: 'active', label: 'Estado', field: 'active', align: 'center' },
  { name: 'createdAt', label: 'Fecha de creación', field: 'createdAt', align: 'center' },
  { name: 'actions', label: 'Acciones', field: 'id', align: 'center' },
];

const skeletonRows = computed(() => pagination.value.rowsPerPage || DEFAULT_ROWS_PER_PAGE);

type TableRequestProps = Parameters<NonNullable<QTableProps['onRequest']>>[0];

function parsePositiveInt(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function readStringParam(value: unknown): string | undefined {
  return typeof value === 'string' && value !== '' ? value : undefined;
}

function readRowsPerPage(): number {
  return parsePositiveInt(route.query.rowsPerPage, DEFAULT_ROWS_PER_PAGE);
}

function readFiltersFromRoute(): Record<string, string> {
  const filters: Record<string, string> = {};
  const name = readStringParam(route.query.name);
  const type = readStringParam(route.query.type);
  const active = readStringParam(route.query.active);

  if (name) filters.name = name;
  if (type) filters.type = type;
  if (active) filters.active = active;

  return filters;
}

function typeMeta(type: PaymentMethodType) {
  return paymentMethodTypeMeta[type];
}

function onSearch(values: Record<string, string>): void {
  const query: Record<string, string> = { ...values };
  const rowsPerPage = readRowsPerPage();
  if (rowsPerPage !== DEFAULT_ROWS_PER_PAGE) {
    query.rowsPerPage = String(rowsPerPage);
  }
  // Sin `page` en la URL → vuelve a la página 1.
  void router.replace({ query });
}

function onClear(): void {
  const query: Record<string, string> = {};
  const rowsPerPage = readRowsPerPage();
  if (rowsPerPage !== DEFAULT_ROWS_PER_PAGE) {
    query.rowsPerPage = String(rowsPerPage);
  }
  // Sin `page` en la URL → vuelve a la página 1.
  void router.replace({ query });
}

function onRequest(props: TableRequestProps): void {
  const { page, rowsPerPage } = props.pagination;

  const query: Record<string, string> = readFiltersFromRoute();
  if (page > 1) {
    query.page = String(page);
  }
  if (rowsPerPage !== DEFAULT_ROWS_PER_PAGE) {
    query.rowsPerPage = String(rowsPerPage);
  }

  void router.replace({ query });
}

function onDelete(row: PaymentMethod): void {
  Dialog.create({
    component: ConfirmDeleteDialog,
    componentProps: { id: row.id, name: row.name },
  }).onOk(() => {
    const shouldGoBack = store.items.length === 0 && store.total > 0 && pagination.value.page > 1;

    if (!shouldGoBack) {
      return;
    }

    const query: Record<string, string> = readFiltersFromRoute();
    query.page = String(pagination.value.page - 1);
    const rowsPerPage = readRowsPerPage();
    if (rowsPerPage !== DEFAULT_ROWS_PER_PAGE) {
      query.rowsPerPage = String(rowsPerPage);
    }
    void router.replace({ query });
  });
}

async function reload(): Promise<void> {
  const page = parsePositiveInt(route.query.page, 1);
  const rowsPerPage = readRowsPerPage();
  const filters = readFiltersFromRoute();

  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;

  await store.fetchPaymentMethods({ page, rowsPerPage, ...filters });
  pagination.value.rowsNumber = store.total;
}

watch(
  () => route.query,
  () => {
    void reload();
  },
  { immediate: true },
);
</script>

<style scoped>
.pm-skeleton-row {
  height: 48px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.pm-skeleton-footer {
  height: 50px;
}
</style>
