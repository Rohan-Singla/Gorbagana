import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function sha256(data: string): Promise<string> {
  const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(data));
  const hex = Array.from(new Uint8Array(buffer))
    .map(x => x.toString(16).padStart(2, "0"))
    .join("");
  console.log("🔹 Frontend hash for:", data, "=>", hex);
  return hex;
}
