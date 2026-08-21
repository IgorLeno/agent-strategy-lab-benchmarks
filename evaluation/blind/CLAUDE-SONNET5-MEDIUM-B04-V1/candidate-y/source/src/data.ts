import raw from '../data/financial.json';
import type { FinancialDocument } from './lib/finance';

export const financial = raw as FinancialDocument;
