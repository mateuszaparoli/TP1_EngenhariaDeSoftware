import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Convert author name to URL-friendly slug
export function authorNameToSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with hyphens
    .replace(/[^\w\-]/g, '')        // Remove special characters except hyphens
    .replace(/--+/g, '-')           // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '');         // Remove leading/trailing hyphens
}
