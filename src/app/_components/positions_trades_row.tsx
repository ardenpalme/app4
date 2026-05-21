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
import { PositionSchema, PositionTradesSchema } from "@/schemas/position";
import { ChevronDown } from "lucide-react";
import { Fragment, useState } from "react";
import { format } from "@formkit/tempo"

export function PositionTradesRow({position} : {position : PositionTradesSchema}) {
  const [open, setOpen] = useState(false)

  return (
    <>
    <Fragment key={position.id}>
      <TableRow className="hover:bg-muted/50">
        <TableCell>
          <ChevronDown
            className={`cursor-pointer size-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
            onClick={() => setOpen((prev) => !prev)}
          />
        </TableCell>
        <TableCell className="text-sm">{position.underlying}</TableCell>
        <TableCell className="text-sm">{format(position.openedAt, "short")}</TableCell>
        <TableCell className="text-sm">{position.capitalUsed.toFixed(2)}</TableCell>
      </TableRow>

      {open && (
        <TableRow>
          <TableCell colSpan={4} className="p-0">
            <div className="border-b border-border bg-muted/30 px-6 py-3">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs">Long/Short</TableHead>
                    <TableHead>Qty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {position.trades.map((trade) => (
                    <TableRow key={trade.id} className="hover:bg-transparent">
                      <TableCell className="py-1.5 text-sm">{trade.direction}</TableCell>
                      <TableCell className="py-1.5 text-sm">{trade.quantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TableCell>
        </TableRow>
      )}
    </Fragment>
  </>
  );
}
