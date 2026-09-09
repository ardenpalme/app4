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
  FieldError,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { ScheduleSchema } from "@/schemas/garden";
import { ChevronDown, Clock2Icon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

function WeatherMap({ lat = 45.283563805956376, lng = 0.06211854617756197 }) {
  return (
    <iframe
      title="weather"
      width="100%"
      height={200}
      style={{ border: 0, borderRadius: 8 }}
      src={`https://embed.windy.com/embed2.html?lat=${lat}&lon=${lng}&zoom=10&overlay=temp&level=surface`}
    />
  );
}

const inputScheduleSchema = z.object({
  start: z.string(),
  zones: z.array(z.number().int().min(2).max(120)),
  auto: z.boolean(),
})

export default function GardenClient() {
  const {data : schedule, isLoading : isScheduleLoading} = trpc.schedule.list.useQuery()
  const {data : logs, isLoading : isLogsLoading} = trpc.log.listLatest.useQuery()
  const updateSchedule = trpc.schedule.updateUnique.useMutation()
  const [isLogsOpen, setIsLogsOpen] = useState(false)

  const zoneCount = schedule?.zone_durations.length ?? 0
  const form = useForm<z.infer<typeof inputScheduleSchema>>({
    resolver: zodResolver(inputScheduleSchema),
    defaultValues: { start: "", zones: [], auto: false },
    values: schedule
      ? {
          start: schedule.start,
          zones: schedule.zone_durations.map((s) => Math.round(s / 60)),
          auto: schedule.auto,
        }
      : undefined,
    resetOptions: { keepDirtyValues: true },
  })

  const onSubmit = async (data: z.infer<typeof inputScheduleSchema>) => {
    if (!schedule) return
    await updateSchedule.mutateAsync({
      id: schedule.id,
      start: data.start,
      zone_durations: data.zones.map((m) => m * 60),
      auto: data.auto,
    })
  }

  return (
    <>
      <div className="flex gap-x-4 justify-items-center">
        <div className="w-3/4">
          <Card className="w-full">
            <CardHeader className="flex items-center justify-between">
              <CardTitle> Watering Schedule </CardTitle>
              <Button className="cursor-pointer" size="sm" type="submit" form="form-schedule"> Submit </Button>
            </CardHeader>
            <CardContent>
            <CardDescription>
              Garden zone watering times (minutes)
            </CardDescription>
            {isScheduleLoading && <Skeleton className="w-full h-20"/> }
            {!isScheduleLoading && <form id="form-schedule" onSubmit={form.handleSubmit(onSubmit)}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Start Time</TableHead>
                  {Array.from({ length: zoneCount }, (_, i) => (
                    <TableHead key={i}>Zone {String.fromCharCode(65 + i)}</TableHead>
                  ))}
                  <TableHead>Automatic?</TableHead>
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

                  {Array.from({ length: zoneCount }, (_, i) => (
                  <TableCell key={i}>
                    <Controller
                      name={`zones.${i}` as const}
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <Input
                            {...field}
                            id={`zone-${i}`}
                            type="number"
                            value={field.value ?? ""}
                            onChange={(e) => {
                              const n = e.target.valueAsNumber
                              field.onChange(Number.isNaN(n) ? undefined : n)
                            }}
                          />
                          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                      )}
                    />
                  </TableCell>
                  ))}

                  <TableCell className="text-center" >
                    <Controller
                      name="auto"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Checkbox id="auto" 
                          className="cursor-pointer"
                          checked={field.value}
                          onCheckedChange={(checked) => field.onChange(checked === true)}
                        />
                      )}
                    />
                  </TableCell>
              </TableRow>
            </TableBody>
            </Table>
            </form>}
            </CardContent>
          </Card>
        </div>
        <div className="w-1/4">
          <WeatherMap/>
        </div>
      </div>
    <Collapsible
      open={isLogsOpen}
      onOpenChange={setIsLogsOpen}
      >
      <Card>
          <CardHeader className="flex items-center gap-x-4 justify-items">  
            <CardTitle> Device Logs </CardTitle> 
            <CollapsibleTrigger asChild >
              <Button size="sm" className="cursor-pointer">
                <ChevronDown /><span className="sr-only">Device Logs</span>
              </Button>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
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
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </>
  );
}

