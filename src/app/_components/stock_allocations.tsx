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

import { TradPortfolio } from "@/lib/types";

export function StockAllocations({tradPf} : {tradPf : TradPortfolio}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Token</TableHead>
          <TableHead>Balance</TableHead>
          <TableHead className="text-right">Balance (USD)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Object.keys(tradPf.positions).map((contract) => (
          <TableRow key={tradPf.positions[contract].conid}>
            <TableCell className="font-medium">{contract}</TableCell>
            <TableCell>{tradPf.positions[contract].position}</TableCell>
            <TableCell className="text-right">{tradPf.positions[contract].mktValue}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={2}>Total</TableCell>
          <TableCell className="text-right">
          {Object.keys(tradPf.positions).reduce((acc, contract) => {
            return acc + tradPf.positions[contract].mktValue
          },0)}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
