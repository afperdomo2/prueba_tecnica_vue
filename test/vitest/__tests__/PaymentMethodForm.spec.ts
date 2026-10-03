import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PaymentMethodForm from '@/features/payment-methods/components/PaymentMethodForm.vue';
import type { PaymentMethod, PaymentMethodFormValues } from '@/features/payment-methods/types';

installQuasarPlugin();

const method: PaymentMethod = {
  id: 'pm_001',
  name: 'Visa terminación 4242',
  type: 'credit_card',
  active: true,
  createdAt: '2026-01-15T10:30:00.000Z',
  description: 'Tarjeta principal',
};

function findButtonByLabel(wrapper: ReturnType<typeof mount>, label: string) {
  return wrapper.findAll('button').find((btn) => btn.text().includes(label));
}

describe('PaymentMethodForm', () => {
  it('precarga los campos cuando recibe method', () => {
    const wrapper = mount(PaymentMethodForm, { props: { method } });

    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('Visa terminación 4242');
    expect((wrapper.find('textarea').element as HTMLTextAreaElement).value).toBe(
      'Tarjeta principal',
    );
  });

  it('emite submit con los valores del formulario', async () => {
    const wrapper = mount(PaymentMethodForm, { props: { method } });

    await wrapper.find('input').setValue('Nueva Visa');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    const firstCall = wrapper.emitted('submit')?.[0]?.[0] as PaymentMethodFormValues | undefined;

    expect(firstCall).toEqual({
      name: 'Nueva Visa',
      type: 'credit_card',
      description: 'Tarjeta principal',
    });
  });

  it('emite cancel al pulsar Cancelar', async () => {
    const wrapper = mount(PaymentMethodForm);

    await findButtonByLabel(wrapper, 'Cancelar')!.trigger('click');

    expect(wrapper.emitted('cancel')).toBeTruthy();
  });

  it('no emite submit si los campos requeridos están vacíos', async () => {
    const wrapper = mount(PaymentMethodForm);

    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(wrapper.emitted('submit')).toBeUndefined();
  });

  it('deshabilita campos y botones cuando saving es true', () => {
    const wrapper = mount(PaymentMethodForm, { props: { saving: true } });

    const saveBtn = findButtonByLabel(wrapper, 'Guardar');
    const cancelBtn = findButtonByLabel(wrapper, 'Cancelar');

    expect((saveBtn!.element as HTMLButtonElement).disabled).toBe(true);
    expect((cancelBtn!.element as HTMLButtonElement).disabled).toBe(true);
    expect((wrapper.find('input').element as HTMLInputElement).disabled).toBe(true);
  });
});
