<template>
  <div class="login-page row items-center justify-center q-pa-md">
    <q-card class="login-card" flat bordered>
      <q-card-section class="text-center q-pb-none">
        <h5 class="q-mb-xs text-primary text-weight-bold">Iniciar sesión</h5>
        <p class="text-grey-7 q-mb-none">Ingresa tus credenciales para continuar</p>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit">
          <q-input
            v-model="form.username"
            label="Usuario"
            name="username"
            autocomplete="username"
            outlined
            dense
            class="q-mb-md"
            :disable="isLoading"
            :rules="[requiredRule]"
            autofocus
          >
            <template #prepend>
              <q-icon name="person" />
            </template>
          </q-input>

          <q-input
            v-model="form.password"
            label="Contraseña"
            name="password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
            outlined
            dense
            class="q-mb-lg"
            :disable="isLoading"
            :rules="[requiredRule]"
          >
            <template #prepend>
              <q-icon name="lock" />
            </template>
            <template #append>
              <q-icon
                :name="showPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>

          <q-btn
            type="submit"
            color="primary"
            label="Ingresar"
            no-caps
            unelevated
            class="full-width"
            :loading="isLoading"
          />
        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const showPassword = ref(false);

const form = reactive({
  username: '',
  password: '',
});

const isLoading = computed(() => authStore.status === 'loading');

function requiredRule(value: unknown): boolean | string {
  return typeof value === 'string' && value.trim().length > 0
    ? true
    : 'Este campo es obligatorio.';
}

async function onSubmit(): Promise<void> {
  const success = await authStore.login({ ...form });
  if (!success) {
    return;
  }

  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/';
  await router.push(redirect);
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
}

.login-card {
  width: 100%;
  max-width: 400px;
  border-radius: 12px;
}
</style>
