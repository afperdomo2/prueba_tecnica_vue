import { defineBoot } from '#q-app';
import { useAuthStore } from '@/features/auth/stores/auth.store';

/**
 * Hidrata la sesión desde localStorage antes de montar la app,
 * para que el guard de rutas sea significativo tras un refresh.
 */
export default defineBoot(() => {
  useAuthStore().restoreSession();
});
