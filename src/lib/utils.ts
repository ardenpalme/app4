import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { timingSafeEqual } from "crypto";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function normalizePrices(data : {date: Date, balance: number}[]) {
  // assume dates sorted
  const ret = data.map((ele, idx, arr) => {
    let pct_change = 0
    if(idx > 0) {
      pct_change = (ele.balance - arr[0].balance) / arr[0].balance
    }else{
      pct_change = 0
    }
    return {
      ...ele,
      balance: pct_change
    }
  })
  return ret
}

export function isValidKey(provided: string): boolean {
  const expected = process.env.ESP32_API_KEY;
  if (!expected) return false;

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  // Length check first — timingSafeEqual throws on length mismatch
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
