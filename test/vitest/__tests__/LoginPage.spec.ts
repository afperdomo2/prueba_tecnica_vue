import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createMemoryHistory, createRouter } from 'vue-router';
import { beforeEach, describe, expect, it } from 'vitest';
import LoginPage from '@/features/auth/pages/LoginPage.vue';

installQuasarPlugin();

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'payment-methods', component: { template: '<div />' } },
      { path: '/login', name: 'login', component: LoginPage },
    ],
  });
}

describe('LoginPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('renderiza el formulario de login', async () => {
    const router = createTestRouter();
    await router.push('/login');
    await router.isReady();

    const wrapper = mount(LoginPage, {
      global: { plugins: [router] },
    });

    expect(wrapper.text()).toContain('Iniciar sesión');
    expect(wrapper.find('input[name="username"]').exists()).toBe(true);
    expect(wrapper.find('input[name="password"]').exists()).toBe(true);
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true);
  });
});
