import { describe, expect, it } from 'vitest';
import { formatDateShort, formatDateTime } from '@/utils/date';

describe('date utils', () => {
  it('formatDateShort muestra día, mes y año en español', () => {
    expect(formatDateShort('2026-09-24T10:30:00.000Z')).toMatch(/^24 [a-z]+\.? 2026$/);
  });

  it('formatDateTime incluye fecha y hora', () => {
    const result = formatDateTime('2026-09-24T10:30:00.000Z');

    expect(result).toContain('24/09/2026');
    expect(result).toContain('10:30');
  });
});
