import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CryptoPortfolio } from "@/lib/types";

export function CryptoAllocations({cryptoPf} : {cryptoPf : CryptoPortfolio }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Token</TableHead>
          <TableHead>Balance</TableHead>
          <TableHead className="hidden sm:table-cell">Daily Change</TableHead>
          <TableHead className="text-right">Balance (USD)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Object.keys(cryptoPf).map((token) => (
          <TableRow key={cryptoPf[token].contractAddress}>
            <TableCell className="font-medium">{token}</TableCell>
            <TableCell>{cryptoPf[token].balance}</TableCell>
            <TableCell className="hidden sm:table-cell">{cryptoPf[token].pct_change}</TableCell>
            <TableCell className="text-right">{cryptoPf[token].balance_usd}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      {/*
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3} className="sm:col-span-1">Total</TableCell>
          <TableCell className="text-right">
          {Object.keys(cryptoPf).reduce((acc, token) => {
            return acc + cryptoPf[token].balance_usd
          },0)}
          </TableCell>
        </TableRow>
      </TableFooter>
      */}
    </Table>
  );
}
