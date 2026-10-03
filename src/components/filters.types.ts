export interface FilterFieldOption {
  label: string;
  value: string;
}

export interface FilterField {
  name: string;
  label: string;
  type: 'text' | 'select';
  options?: FilterFieldOption[];
  required?: boolean;
  placeholder?: string;
}
