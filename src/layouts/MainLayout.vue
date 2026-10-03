<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title class="text-weight-bold"> Prueba técnica </q-toolbar-title>

        <q-space />

        <div class="row items-center q-gutter-md">
          <div class="column items-end">
            <div class="text-subtitle2">{{ authStore.user?.name ?? '' }}</div>
            <div class="text-caption text-grey-4">{{ authStore.user?.email ?? '' }}</div>
          </div>

          <q-btn flat dense round icon="logout" aria-label="Cerrar sesión" @click="onLogout">
            <q-tooltip>Cerrar sesión</q-tooltip>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { Dialog } from 'quasar';
import { useAuthStore } from '@/features/auth/stores/auth.store';

const router = useRouter();
const authStore = useAuthStore();

function onLogout(): void {
  Dialog.create({
    title: 'Cerrar sesión',
    message: '¿Seguro que deseas cerrar sesión?',
    ok: {
      label: 'Cerrar sesión',
      color: 'negative',
      flat: true,
      noCaps: true,
    },
    cancel: {
      label: 'Cancelar',
      flat: true,
      noCaps: true,
    },
    persistent: true,
  }).onOk(() => {
    authStore.logout();
    void router.push({ name: 'login' });
  });
}
</script>
