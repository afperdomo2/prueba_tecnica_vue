import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/features/auth/pages/LoginPage.vue'),
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'payment-methods',
        component: () => import('@/features/payment-methods/pages/PaymentMethodsPage.vue'),
      },
      {
        path: 'payment-methods/new',
        name: 'payment-method-create',
        component: () => import('@/features/payment-methods/pages/PaymentMethodFormPage.vue'),
      },
      {
        path: 'payment-methods/:id/edit',
        name: 'payment-method-edit',
        component: () => import('@/features/payment-methods/pages/PaymentMethodFormPage.vue'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('@/pages/ErrorNotFound.vue'),
  },
];

export default routes;
