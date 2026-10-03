export type PaymentMethodType = 'credit_card' | 'debit_card' | 'bank_account' | 'digital_wallet';

export interface PaymentMethod {
  id: string;
  name: string;
  type: PaymentMethodType;
  active: boolean;
  createdAt: string;
  description?: string;
}

export interface PaymentMethodFormValues {
  name: string;
  type: PaymentMethodType;
  description?: string;
}
