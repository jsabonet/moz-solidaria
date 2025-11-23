import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatar valores monetários consistentemente como MZN
 * Evita exibição da moeda antiga MTn em qualquer navegador
 */
export function formatCurrency(value: number): string {
  // Usar formatação numérica simples para evitar problemas de locale
  const formatted = new Intl.NumberFormat('pt-PT', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(value);
  
  // Garantir que sempre retorne MZN, nunca MTn
  return `MZN ${formatted}`.replace(/MTn/g, 'MZN');
}

/**
 * Formatar números grandes com separadores de milhares
 * Exibe valores completos sem abreviações (acessível para usuários com baixa alfabetização)
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-PT').format(value);
}

/**
 * Formatar percentagem
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}
