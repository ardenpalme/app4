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
import { format } from "@formkit/tempo";


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
  const {data : logs, isLoading : isLogsLoading} = trpc.log.listLatest.useQuery()
  return (
    <Card>
      <CardHeader> Watering Schedule </CardHeader>
      <CardContent>
          {isSchedulesLoading && <p>Loading...</p>}
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
                  <TableCell> {schedule.start} </TableCell>
                  <TableCell> {formatDuration(schedule.durationSec)} </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>)}
          {logs && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.time}>
                  <TableCell> {log.time ? format(log.time, { date: "medium", time: "long" }, 'de') : ""} </TableCell>
                  <TableCell> {log.message} </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>)}

      </CardContent>
    </Card>
  );
}
