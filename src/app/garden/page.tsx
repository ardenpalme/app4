"use client"

import { trpc } from "../_trpc/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { format } from "@formkit/tempo";

import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Field,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { ScheduleSchema } from "@/schemas/garden";
import { Clock2Icon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { nanoid } from "nanoid";

function WeatherMap({ lat = 45.283563805956376, lng = 0.06211854617756197 }) {
  return (
    <iframe
      title="weather"
      width="100%"
      height={300}
      style={{ border: 0, borderRadius: 8 }}
      src={`https://embed.windy.com/embed2.html?lat=${lat}&lon=${lng}&zoom=10&overlay=temp&level=surface`}
    />
  );
}

const inputScheduleSchema = z.object({
  durationMin : z.number().int(),
  start: z.string(),
  auto: z.boolean(),
})

export default function GardenPage() {
  const {data : schedule, isLoading : isScheduleLoading} = trpc.schedule.list.useQuery()
  const {data : logs, isLoading : isLogsLoading} = trpc.log.listLatest.useQuery()
  const updateSchedule = trpc.schedule.updateUnique.useMutation();

  const form = useForm<z.infer<typeof inputScheduleSchema >>({
    resolver: zodResolver(inputScheduleSchema),
    defaultValues: { start: "", durationMin: 0, auto: false },
    values: schedule
      ? { start: schedule.start, durationMin: Math.round(schedule.durationSec / 60), auto: schedule.auto }
      : undefined,
    resetOptions: { keepDirtyValues: true }, // untouched fields update
  });

  const onSubmit = async (data: z.infer<typeof inputScheduleSchema>) => {
    if(!schedule) return;
    const payload : z.infer<typeof ScheduleSchema> = {
      id: schedule?.id ?? nanoid(),
      start : data.start,//.substring(0, data.start.length-2),
      durationSec : data.durationMin * 60,
      auto: data.auto,
    }
    console.log(payload)
    await updateSchedule.mutateAsync(payload);
  }

  return (
    <>
      <div className="flex gap-x-4 justify-items-center">
        <div className="w-1/2">
          <Card className="w-full">
            <CardHeader className="flex items-center justify-between">
              <CardTitle> Watering Schedule </CardTitle>
              <Button className="cursor-pointer" size="sm" type="submit" form="form-schedule"> Submit </Button>
            </CardHeader>
            <CardContent>
              <form id="form-schedule" onSubmit={form.handleSubmit(onSubmit)}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Start</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Automatic</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <Controller
                      name="start"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <InputGroup>
                            <InputGroupInput
                              {...field}
                              id="start"
                              type="time"
                            />
                            <InputGroupAddon>
                              <Clock2Icon className="text-muted-foreground" />
                            </InputGroupAddon>
                          </InputGroup>
                        </Field>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <Controller
                      name="durationMin"
                      control={form.control}
                      render={({ field }) => (
                        <Field>
                        <Input
                          {...field}
                          id="durationMin"
                          type="number"
                          value={field.value==0 ? "" : field.value}
                          onChange={(e) => {
                            const n = e.target.valueAsNumber;
                            field.onChange(Number.isNaN(n) ? undefined : n);
                          }}
                        />
                        </Field>
                      )}
                    />
                  </TableCell>
                  <TableCell className="text-center" >
                    <Controller
                      name="auto"
                      control={form.control}
                      render={({ field }) => (
                        <Checkbox id="auto" 
                          checked={field.value}
                          onCheckedChange={(checked) => field.onChange(checked === true)}
                        />
                      )}
                    />
                  </TableCell>
              </TableRow>
            </TableBody>
            </Table>
              </form>
            </CardContent>
          </Card>
        </div>
        <div className="w-1/2">
          <WeatherMap/>
        </div>
      </div>
      <Card>
        <CardHeader> Device Logs </CardHeader>
        <CardContent>
          {isLogsLoading && <Skeleton className="w-full h-32"/>}
          {logs && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Message</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.time}>
                  <TableCell colSpan={1}> {log.time ? format(log.time, { date: "medium", time: "long" }, 'de') : ""} </TableCell>
                  <TableCell className="text-left"> {log.message} </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>)}
        </CardContent>
      </Card>
    </>
  );
}
