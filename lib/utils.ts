import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = "MYR"): string {
  return new Intl.NumberFormat('ms-MY', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export function formatMalaysianPhone(phone: string): string {
  // +60123456789 → +60 12-345 6789
  return phone.replace(/(\+60)(\d{2})(\d{3})(\d{4})/, '$1 $2-$3 $4');
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function calculateProgress(raised: number, goal: number): number {
  if (goal === 0) return 0;
  return Math.min(Math.round((raised / goal) * 100), 100);
}
