import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getSafePhotoUrl(raw?: string | null) {
  if (!raw || typeof raw !== 'string' || raw.length < 5) return undefined;
  
  const lower = raw.toLowerCase().trim();
  if (lower.includes('/null') || lower.includes('/undefined') || lower === 'null' || lower === 'undefined') return undefined;
  
  // Enforce https for all external URLs (Cloudinary, etc)
  if (raw.startsWith('http')) {
    return raw.trim().replace(/^http:\/\//i, 'https://');
  }
  
  // If it's a relative path, prepend API URL
  if (raw.startsWith('/')) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return `${cleanBase}${raw}`;
  }
  
  return undefined;
}
