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

export function isValidKey(provided : string, expected : string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
