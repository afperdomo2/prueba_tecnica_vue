import type { PaymentMethodType } from './types';

interface PaymentMethodTypeMeta {
  label: string;
  icon: string;
}

export const paymentMethodTypeMeta: Record<PaymentMethodType, PaymentMethodTypeMeta> = {
  credit_card: { label: 'Tarjeta de crédito', icon: 'credit_card' },
  debit_card: { label: 'Tarjeta de débito', icon: 'credit_score' },
  bank_account: { label: 'Cuenta bancaria', icon: 'account_balance' },
  digital_wallet: { label: 'Billetera digital', icon: 'account_balance_wallet' },
};

export interface FilterOption {
  label: string;
  value: string;
}

export const paymentMethodTypeOptions: FilterOption[] = (
  Object.keys(paymentMethodTypeMeta) as PaymentMethodType[]
).map((value) => ({
  label: paymentMethodTypeMeta[value].label,
  value,
}));

export const paymentMethodActiveOptions: FilterOption[] = [
  { label: 'Activo', value: 'true' },
  { label: 'Inactivo', value: 'false' },
];
