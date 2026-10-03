import type { Router } from 'vue-router';
import { useAuthStore } from '@/features/auth/stores/auth.store';

/**
 * Guard de autenticación global.
 *
 * - Redirige a `/login` (guardando la ruta de destino) si se intenta acceder a
 *   una ruta protegida sin sesión activa.
 * - Redirige a la pantalla principal si un usuario autenticado visita `/login`.
 */
export function setupAuthGuard(router: Router): void {
  router.beforeEach((to) => {
    const authStore = useAuthStore();
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

    if (requiresAuth && !authStore.isAuthenticated) {
      return {
        name: 'login',
        query: { redirect: to.fullPath },
      };
    }

    if (to.name === 'login' && authStore.isAuthenticated) {
      return { name: 'payment-methods' };
    }

    return true;
  });
}
