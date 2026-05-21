import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

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
