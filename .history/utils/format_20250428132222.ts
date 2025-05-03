import { CURRENCY } from '@/constants/config';

export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString('ar-SA')} ${CURRENCY}`;
} 