"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "@formkit/tempo"
import { Calendar as CalendarIcon, Minus, PlusCircle, PlusIcon, Trash } from "lucide-react"
 
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BlogPostSchema, CreatePostInputSchema } from "@/schemas/blog"
import { trpc } from "../_trpc/client"
import { ChevronDown, Plus } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { CreateStrategyInputSchema, RiskProfileEnum, StrategyCategoryEnum, StrategySchema, StrategyStatusEnum, TimeframeEnum } from "@/schemas/strategy"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
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
import { CreateTradeSchema, OrderTypeEnum, TradeDirectionEnum, TradeStatusEnum, UpdateTradeSchema } from "@/schemas/trade"
import { Switch } from "@/components/ui/switch"
import { nanoid } from "nanoid"
import {PositionStatusEnum, CreatePositionSchema, UpdatePositionSchema } from "@/schemas/position"

const formSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  description: z.string(),
  category: StrategyCategoryEnum.nullable(),
  timeframe: TimeframeEnum.nullable(),
  riskProfile: RiskProfileEnum.nullable(),
  status: StrategyStatusEnum.nullable(),
  createdAt: z.date().optional(),
  post: z.object({
    id: z.number().nullable()
  }),
  positions: z.array(z.object({
    id: z.number().nullable(),
    underlying: z.string(),
    openedAt : z.date(),
    capitalUsed : z.number(),
    status: PositionStatusEnum.nullable(),
    notes: z.string().optional(),
    trades: z.array(z.object({
      id: z.number().nullable(),
      date: z.date().nullable(),
      direction: TradeDirectionEnum.nullable(),
      orderType: OrderTypeEnum.nullable(),
      status: TradeStatusEnum.nullable(),
      quantity: z.number(),
    })),
  })),
})

const dfl_form_vals : z.infer<typeof formSchema>= {
  id: undefined,
  name: "",
  description: "",
  category: null,
  timeframe: null,
  riskProfile: null,
  status: null,
  post: { id: null },
  positions: [{
    id: null,
    underlying: "",
    openedAt: new Date(),
    capitalUsed: 0,
    status: null,
    trades : [{
      id: null,
      date: null,
      direction: null,
      orderType: null,
      status: null,
      quantity: 0,
    }]
  }]
}

export function StrategyCreator() {
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [selectedStrategyId, setSelectedStrategyId] = React.useState<number | null>(null);
  const [preview, setPreview] = React.useState<z.infer<typeof formSchema> | null>(null)

  const {data: strategies } = trpc.strategy.listAll.useQuery()
  const {data: posts } = trpc.blog.listAllPosts.useQuery()
  const upsertStrategy = trpc.strategy.upsertStrategy.useMutation()

  const updatePositions = trpc.position.update.useMutation()
  const createPositions = trpc.position.create.useMutation()
  const updateTrades = trpc.trade.update.useMutation()
  const createTrades = trpc.trade.create.useMutation()

  const { data: selectedStrategy } = trpc.strategy.getById.useQuery(selectedStrategyId, { enabled: !!selectedStrategyId });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: dfl_form_vals,
  });

  let newPosArray: string[]= [];
  const { fields: positionFields, append: appendPosition, remove: removePosition } = useFieldArray({
    control : form.control,
    name: "positions",
  });

  const addPosition = () => {
    appendPosition(dfl_form_vals.positions)
    const newId = positionFields[positionFields.length - 1]?.id;
    if (newId) {
      newPosArray.push(newId); // but newPosArray might need to be state or ref.
    }
  }

  let newTradeArray: {pos_idx: number, trade_idx: number}[] = [];
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if(data.post.id === null) {
      toast("Strategy must associate to a post")
      return
    }

    if(data.post.id != selectedStrategy?.post.id) {
      toast("Switch posts for strategy in Post tab")
      return
    }

    const payload : CreateStrategyInputSchema = {
      id: selectedStrategyId,
      name: data.name,
      description: data.description,
      category: data.category ?? "INCOME",
      timeframe: data.timeframe ?? "WEEKLY",
      riskProfile: data.riskProfile ?? "LOW",
      status: data.status ?? "ACTIVE",
      post: { id: data.post.id }, 
    };
    const res = await upsertStrategy.mutateAsync(payload);
    console.log(`upsertStrategy() returned: ${res}`)

    // Editing a current strategy
    if(selectedStrategyId != null) {
      const update_pos_payload  = data.positions.map(((pos) => {
        // ensure that the pos.id exists in remote db
        if(pos.id != null) { 
          return {
            positionId: pos.id,
            strategyId: selectedStrategyId,
            underlying: pos.underlying,
            openedAt: pos.openedAt,
            capitalUsed: pos.capitalUsed,
            status: pos.status,
          }
        }
      }))

      if (update_pos_payload.length > 0) {
        await updatePositions.mutateAsync(update_pos_payload as UpdatePositionSchema[])
      }

      const create_pos_payload = newPosArray.map((ele) => {
        const position = positionFields.find((field) => {if(field) { return field.id === ele} else { return false}});
        if(position){
          return {
            strategyId: selectedStrategyId,
            underlying: position.underlying,
            openedAt: position.openedAt,
            capitalUsed: position.capitalUsed,
            status: position.status,
          }
        }
      })

      if (create_pos_payload.length > 0) {
        await createPositions.mutateAsync(update_pos_payload as CreatePositionSchema[])
      }

      // flatMap flattens the inner arrays into one level.
      // filter ensures only valid trades are mapped.
      const update_trades_payload = data.positions.flatMap((pos) =>
        pos.trades
          .filter((trade) => trade.id != null && pos.id != null)
          .map((trade) => ({
            date: trade.date,
            direction: trade.direction,
            orderType: trade.orderType,
            status: trade.status,
            quantity: trade.quantity,
            positionId: pos.id,
            tradeId: trade.id,
          }))
      );

      if(update_trades_payload.length > 0) {
        await updateTrades.mutateAsync(update_trades_payload as UpdateTradeSchema[])
      }

      const create_trade_payload = newTradeArray.map((ele) => {
        if(ele.pos_idx != null) { 
          const { fields: tradeFields } = useFieldArray({
            control : form.control,
            name: `positions.${ele.pos_idx}.trades`,
          });
          const trade = tradeFields.find((field) => field.id === ele.trade_idx);
          if(trade) {
            return {   
              date: trade.date,
              direction: trade.direction,
              orderType: trade.orderType,
              status: trade.status,
              quantity: trade.quantity,
              positionId: ele.pos_idx,
            }
          }
        }
      })
      if(create_trade_payload.length > 0) {
        await createTrades.mutateAsync(create_trade_payload as CreateTradeSchema[])
      }
    }
  }

  // Update form when selectedStrategy changes
  React.useEffect(() => {
  if (selectedStrategy) {
    setIsEditMode(true);

    // Transform dates
    const adaptedStrategy = {
      ...selectedStrategy,
      // Convert top-level createdAt if present
      createdAt: selectedStrategy.createdAt 
        ? new Date(selectedStrategy.createdAt) 
        : undefined,
      // Convert nested dates
      positions: selectedStrategy.positions.map((pos) => ({
        ...pos,
        openedAt: new Date(pos.openedAt),
        trades: pos.trades.map((trade) => ({
          ...trade,
          date: trade.date ? new Date(trade.date) : null,
        })),
      })),
    };

    form.reset(adaptedStrategy);  // ✅
  }
}, [selectedStrategy]);

  const handleStrategySelection = async (value: string) => {
    const id = Number(value);
    setSelectedStrategyId(id);
  };

  const handleNewStrat = () => {
    setSelectedStrategyId(null);
    setIsEditMode(false);
    form.reset({
      ...dfl_form_vals
    });
  };

  const handleSavePreview = () => {
    const {watch} = form
    setPreview(watch());
  };


  

  return (
    <Tabs defaultValue="editor" className="max-w-3/4">
      <TabsList>
        <TabsTrigger value="editor">Edit</TabsTrigger>
        <TabsTrigger value="preview">Preview</TabsTrigger>
      </TabsList>
      <TabsContent value="editor">
        <form id="rhf-strat" onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-3xl flex flex-col gap-y-2">
          <Card className="gap-y-2">
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <CardTitle>
                  {isEditMode ? "Edit strategy" : "Create strategy"}
                </CardTitle>
                <div className="flex items-center gap-2">

                  {/* Post Selector */}
                  {!isEditMode && (<Controller
                    name="post.id"
                    control={form.control}
                    render={({ field }) => (
                      <div className="max-w-40 truncate">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                              {posts?.find((p) => p.id === Number(field.value))?.title ||
                                "Select Post"}
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuLabel>Posts</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuRadioGroup
                              value={field.value?.toString() ?? ""}
                              onValueChange={(value) => field.onChange(value)}
                            >
                              {posts?.map((p) => (
                                <DropdownMenuRadioItem
                                  key={p.id}
                                  value={p.id.toString()}
                                >
                                  {p.title}
                                </DropdownMenuRadioItem>
                              ))}
                            </DropdownMenuRadioGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  />)}

                  {/* Strategy Selector for Editing */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        type="button"
                        className="max-w-40 justify-start"
                        >
                        <span className="truncate">
                        {isEditMode
                          ? strategies?.find((s) => s.id === selectedStrategyId)?.name ||
                            "Select Strategy"
                          : "Edit Existing"}
                        </span>
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-72">
                      <DropdownMenuLabel>Select Strategy to Edit</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuRadioGroup
                        value={selectedStrategyId?.toString() ?? ""}
                        onValueChange={handleStrategySelection}
                      >
                        {strategies?.map((strat) => (
                          <DropdownMenuRadioItem
                            key={strat.id}
                            value={strat.id.toString()}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">{strat.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {strat.description.slice(0, 50)}...
                              </span>
                            </div>
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {isEditMode && (
                    <Button variant="default" size="sm" onClick={handleNewStrat} type="button">
                      New Strat
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                {/* Name */}
                <Controller
                  name="name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} >
                      <FieldLabel className="w-24">
                        Title
                      </FieldLabel>
                      <Input
                        {...field}
                        id="rhf-strat-title"
                        //aria-invalid={fieldState.invalid}
                        placeholder=""
                        autoComplete="off"
                      />
                    </Field>
                  )}
                />

              <div className="flex items-center gap-x-3 "> 
                {/* Risk Profile */}
                  <Controller
                    name="riskProfile"
                    control={form.control}
                    render={({ field }) => (
                      <div className="max-w-40 truncate">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                              {field.value ?? "Select Risk"}
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuLabel>Risk Profiles</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuRadioGroup
                              value={field.value?.toString() ?? ""}
                              onValueChange={(value) => field.onChange(value)}
                            >
                              {RiskProfileEnum.options?.map((ele) => (
                                <DropdownMenuRadioItem
                                  key={ele}
                                  value={ele}
                                >
                                  {ele}
                                </DropdownMenuRadioItem>
                              ))}
                            </DropdownMenuRadioGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                />

                {/* Timeframe */}
                <Controller
                  name="timeframe"
                  control={form.control}
                  render={({ field }) => (
                    <div className="max-w-40 truncate">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline">
                            {field.value ?? "Select Timeframe"}
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuLabel>Timeframes</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuRadioGroup
                            value={field.value?.toString() ?? ""}
                            onValueChange={(value) => field.onChange(value)}
                          >
                            {TimeframeEnum.options?.map((ele) => (
                              <DropdownMenuRadioItem
                                key={ele}
                                value={ele}
                              >
                                {ele}
                              </DropdownMenuRadioItem>
                            ))}
                          </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
              />

                {/* Category */}
                <Controller
                  name="category"
                  control={form.control}
                  render={({ field }) => (
                    <div className="max-w-40 truncate">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline">
                            {field.value ?? "Select Category"}
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuLabel>Categories</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuRadioGroup
                            value={field.value?.toString() ?? ""}
                            onValueChange={(value) => field.onChange(value)}
                          >
                            {StrategyCategoryEnum.options?.map((ele) => (
                              <DropdownMenuRadioItem
                                key={ele}
                                value={ele}
                              >
                                {ele}
                              </DropdownMenuRadioItem>
                            ))}
                          </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
              />

                {/* Status */}
                <Controller
                  name="status"
                  control={form.control}
                  render={({ field }) => (
                    <div className="max-w-40 truncate">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline">
                            {field.value ?? "Select Status"}
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuLabel>Status</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuRadioGroup
                            value={field.value?.toString() ?? ""}
                            onValueChange={(value) => field.onChange(value)}
                          >
                            {StrategyStatusEnum.options?.map((ele) => (
                              <DropdownMenuRadioItem
                                key={ele}
                                value={ele}
                              >
                                {ele}
                              </DropdownMenuRadioItem>
                            ))}
                          </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
              />

              </div>

                {/* Description */}
                <Controller
                  name="description"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>
                        Description
                      </FieldLabel>
                      <InputGroup>
                        <InputGroupTextarea
                          {...field}
                          placeholder=""
                          id="rhf-strat-summary"
                          rows={4}
                          className="min-h-25 resize-none"
                          //aria-invalid={fieldState.invalid}
                        />
                      </InputGroup>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                </FieldGroup>
              </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center gap-x-2">
                <CardTitle> Positions </CardTitle>
                <Button variant="secondary" 
                        className="cursor-pointer" 
                        onClick={addPosition}
                > 
                  <Plus/> Add
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-y-2">
              <Table>
                <TableHeader>
                  <TableRow> 
                    <TableHead> </TableHead>
                    <TableHead> Underlying </TableHead>
                    <TableHead> Open Date </TableHead>
                    <TableHead> Capital Used</TableHead>
                    <TableHead> Status </TableHead>
                    <TableHead> </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                {positionFields?.map((position, positionIndex) => (
                  <PositionsTradesEditorRow
                    key={position.id}
                    position={position}
                    positionIndex={positionIndex}
                    control={form.control}
                    removePosition={removePosition}
                    newTradeArray={newTradeArray}
                  />
                ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <div className="flex items-center gap-2 max-w-20 pt-2">
            <Field orientation="horizontal">
              <Button type="submit" form="rhf-strat" className="cursor-pointer">
                Publish
              </Button>
            </Field>
            <Button type="button" className="cursor-pointer" onClick={handleSavePreview}>
              Save Preview
            </Button>
          </div>
        </form>
      </TabsContent>
      <TabsContent value="preview">
      {!preview && <span>Save the Preview first...</span>}
      {preview && <Card>
          <CardHeader>
            <CardTitle className="">
              {preview.name}
            </CardTitle>
            <div className="flex items-center gap-4">
              <Badge>{preview.status}</Badge>
              <Badge variant="secondary">{preview.category}</Badge>
              <Badge variant="secondary">{preview.timeframe}</Badge>
              <Badge variant="secondary">{preview.riskProfile} RISK</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {preview.description}
            <Card>
              <CardHeader>
                <CardTitle> Positions </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-y-2">
                <Table>
                  <TableHeader>
                    <TableRow> 
                      <TableHead className="w-[100px]"> Underlying </TableHead>
                      <TableHead> Opened </TableHead>
                      <TableHead> Closed </TableHead>
                      <TableHead> Capital </TableHead>
                      <TableHead> rPnL </TableHead>
                      <TableHead> Ret % </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview?.map((pos) => (
                      <TableRow key={pos.id}>
                        <TableCell className="font-medium"> {pos.underlying}</TableCell>
                        <TableCell>{format(pos.openedAt, "en", "short")}</TableCell>
                        <TableCell>{pos.capitalUsed.toFixed(2)}</TableCell>
                        <TableCell>{pos.closedAt ? format(pos.closedAt, "en", "short") : "--"}</TableCell>
                        <TableCell>{pos.realizedPnL ? pos.realizedPnL?.toFixed(2) : "--"}</TableCell>
                        <TableCell>{pos.returnPct ? pos.returnPct?.toFixed(2) : "--"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </CardContent>
        </Card>}
      </TabsContent>
    </Tabs>
  );
}

function PositionsTradesEditorRow({control, position, positionIndex, setValue, removePosition, newTradeArray} : any) {
  const [open, setOpen] = React.useState(false)

  const { fields: tradeFields, append: appendTrade, remove : removeTrade } = useFieldArray({
    control,
    name: `positions.${positionIndex}.trades`,
  });

  const addTrade = () => {
    appendTrade({ direction: "LONG", id: nanoid() });
    const newId = tradeFields[tradeFields.length - 1]?.id;
    if (newId) {
      newTradeArray.push({pos_idx :positionIndex, trade_idx: newId})
    }
  };
  
  return (
    <>
      <TableRow
        key={positionIndex}
        className="hover:bg-muted/50"
      >
        <TableCell>
          <ChevronDown
            className={`cursor-pointer size-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
            onClick={() => setOpen((prev) => !prev)}
          />
        </TableCell>

        {/* Underlying */}
        <TableCell className="text-sm">
          <Controller
            name={`positions.${positionIndex}.underlying`}
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <Input {...field} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </TableCell>

        {/* Opened At */}
        <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
          <Controller
            name={`positions.${positionIndex}.openedAt`}
            control={control}
            render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <DatePicker 
                date={field.value}  // Pass the field's value (selected date)
                setDate={field.onChange}  // Pass field.onChange to update the value
              />
            </Field>
            )}
          />
        </TableCell>

        {/* Capital Used */}
        <TableCell className="text-sm">
          <Controller
            name={`positions.${positionIndex}.capitalUsed`}
            control={control}
            render={({ field }) => (
              <Field>
                <Input {...field} type="number" step="any" />
              </Field>
            )}
          />
        </TableCell>

        <TableCell>
          <Button 
            variant="ghost" 
            className="cursor-pointer text-red-500 hover:text-red-600"
            onClick={() => removePosition(positionIndex)}
          >
            <Trash className="w-4 h-4"/>
          </Button>
        </TableCell>
      </TableRow>

      {open && (
        <tr>
          <td colSpan={9} className="p-0">
          <div className="border-b border-border bg-muted/30 px-6 py-3">
            <Button 
              variant="secondary"
              onClick={addTrade} 
              className="cursor-pointer rounded-full"
              >
              <Plus/> 
            </Button>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs">Long/Short</TableHead>
                    <TableHead> Qty </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tradeFields.map((trade, tradeIndex) => (
                    <TableRow key={trade.id} className="hover:bg-transparent">

                      {/* Direction */}
                      <TableCell className="py-1.5 text-sm">
                        <Controller
                          name={`positions.${positionIndex}.trades.${tradeIndex}.direction`}
                          control={control}
                          render={({ field }) => (
                            <Switch
                              checked={field.value} 
                              onCheckedChange={field.onChange} 
                            />
                          )}
                        />
                      </TableCell>

                      {/* Quantity */}
                      <TableCell className="text-sm">
                        <Controller
                          name={`positions.${positionIndex}.trades.${tradeIndex}.quantity`}
                          control={control}
                          render={({ field }) => (
                            <Field>
                              <Input {...field} type="number" step="any" />
                            </Field>
                          )}
                        />
                      </TableCell>

                      <TableCell>
                        <Button 
                          variant="ghost" 
                          className="cursor-pointer text-red-500 hover:text-red-600"
                          onClick={() => removeTrade(tradeIndex)}
                        >
                          <Minus className="w-4 h-4"/>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

interface DatePickerProps {
  date: Date | undefined;
  setDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
}
export function DatePicker({date, setDate} : DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-empty={!date}
          className="data-[empty=true]:text-muted-foreground w-[280px] justify-start text-left font-normal"
        >
          <CalendarIcon />
          {date ? format(date, "en", "short") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar mode="single" selected={date} onSelect={setDate} />
      </PopoverContent>
    </Popover>
  )
}
