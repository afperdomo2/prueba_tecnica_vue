import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import FiltersPanel from '@/components/FiltersPanel.vue';
import type { FilterField } from '@/components/filters.types';

installQuasarPlugin();

const fields: FilterField[] = [
  { name: 'name', label: 'Nombre', type: 'text' },
  {
    name: 'type',
    label: 'Tipo',
    type: 'select',
    options: [
      { label: 'Tarjeta de crédito', value: 'credit_card' },
      { label: 'Cuenta bancaria', value: 'bank_account' },
    ],
  },
];

function findButtonByLabel(wrapper: ReturnType<typeof mount>, label: string) {
  return wrapper.findAll('button').find((btn) => btn.text().includes(label));
}

describe('FiltersPanel', () => {
  it('renderiza los campos y botones según la config', () => {
    const wrapper = mount(FiltersPanel, { props: { fields } });

    expect(wrapper.text()).toContain('Nombre');
    expect(wrapper.text()).toContain('Tipo');
    expect(wrapper.text()).toContain('Buscar');
    expect(wrapper.text()).toContain('Limpiar');
  });

  it('emite search solo con los valores no vacíos', async () => {
    const wrapper = mount(FiltersPanel, { props: { fields } });

    await wrapper.find('input').setValue('Visa');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    const firstCall = wrapper.emitted('search')?.[0]?.[0] as Record<string, string> | undefined;

    expect(firstCall).toEqual({ name: 'Visa' });
  });

  it('emite clear y resetea los campos al limpiar', async () => {
    const wrapper = mount(FiltersPanel, { props: { fields } });

    await wrapper.find('input').setValue('Visa');
    await findButtonByLabel(wrapper, 'Limpiar')!.trigger('click');

    expect(wrapper.emitted('clear')).toBeTruthy();
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('');
  });

  it('no emite search si un campo requerido está vacío', async () => {
    const requiredFields: FilterField[] = [
      { name: 'name', label: 'Nombre', type: 'text', required: true },
    ];
    const wrapper = mount(FiltersPanel, { props: { fields: requiredFields } });

    await wrapper.find('form').trigger('submit');

    expect(wrapper.emitted('search')).toBeUndefined();
  });

  it('deshabilita campos y botones cuando loading es true', () => {
    const wrapper = mount(FiltersPanel, { props: { fields, loading: true } });

    const searchBtn = findButtonByLabel(wrapper, 'Buscar');
    const clearBtn = findButtonByLabel(wrapper, 'Limpiar');
    const nameInput = wrapper.find('input').element as HTMLInputElement;

    expect((searchBtn!.element as HTMLButtonElement).disabled).toBe(true);
    expect((clearBtn!.element as HTMLButtonElement).disabled).toBe(true);
    expect(nameInput.disabled).toBe(true);
  });
});
