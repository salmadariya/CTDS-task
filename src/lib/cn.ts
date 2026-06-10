import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merges Tailwind classes safely — use for all conditional class merging */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
