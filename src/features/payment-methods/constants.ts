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
