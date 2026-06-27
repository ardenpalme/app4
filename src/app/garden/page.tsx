"use client"

import { trpc } from "../_trpc/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { format } from "@formkit/tempo"

function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const parts: string[] = [];
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  if (s || parts.length === 0) parts.push(`${s}s`);
  return parts.join(" ");
}

export default function GardenPage() {

  const {data : schedules, isLoading : isSchedulesLoading} = trpc.schedule.listAll.useQuery()
  return (
    <Card>
      <CardHeader> Watering Schedule </CardHeader>
      <CardContent>
          {schedules && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Start</TableHead>
                <TableHead>Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell> {format(schedule.start, "medium")} </TableCell>
                  <TableCell> {formatDuration(schedule.durationSec)} </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>)}
      </CardContent>
    </Card>
  );
}
