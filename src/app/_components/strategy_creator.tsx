"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "@formkit/tempo"
import { Calendar as CalendarIcon, Minus, PlusCircle, PlusIcon, Trash } from "lucide-react"

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
import { trpc } from "../_trpc/client"
import { ChevronDown, Plus } from "lucide-react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {  RiskProfileEnum, StrategyCategoryEnum, StrategySchema, StrategyStatusEnum, TimeframeEnum, UpsertStrategyInputSchema } from "@/schemas/strategy"
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
import type {
  UseFormWatch,
  UseFieldArrayRemove,
  FieldArrayWithId,
  UseFormReturn,
} from "react-hook-form"
import { DatePicker } from "./date_picker"
import { PositionTradesRow } from "./positions_trades_row"

type FormValues = z.infer<typeof StrategySchema>;

type PositionsTradesEditorRowProps = {
  control: UseFormReturn<FormValues>["control"];
  watch: UseFormReturn<FormValues>["watch"];

  position: FieldArrayWithId<FormValues, "positions", "id">;
  positionIndex: number;

  removePosition: UseFieldArrayRemove;

  addedPosArray: string[];
  addedTradeArray: string[];

  handleAddTradeToAdded: (tradeId: string) => void;
  handleAddTradeToDelete: (tradeId: string) => void;
  handleRemoveTradeFromAdded: (tradeId: string) => void;

  handleAddPositionToDelete: (posId: string) => void;
  handleRemovePositionFromAdded: (posId: string) => void;
};


const dfl_form_vals : FormValues = {
  id: "NA",
  name: "test",
  description: "test",
  category: "INCOME",
  timeframe: "DAILY",
  riskProfile: "LOW",
  status: "ACTIVE",
  createdAt: new Date(),
  post: { id: null },
  positions: [{
    id: "",
    underlying: "APPL",
    openedAt: new Date(),
    capitalUsed: 0,
    status: "OPEN",
    notes: "example",
    trades : [{
      id: "",
      date: new Date(),
      direction: "LONG",
      orderType: "LIMIT",
      status: "FILLED",
      quantity: 0,
    }]
  }]
}

export function StrategyCreator() {
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [selectedStrategyId, setSelectedStrategyId] = React.useState<string | null>(null);
  const [preview, setPreview] = React.useState<FormValues | null>(null)
  const [selectedStrategy_snap, setSelectedStrategy_snap] = React.useState<FormValues | null>(null);

  const {data: strategies } = trpc.strategy.listAll.useQuery()
  const {data: posts } = trpc.blog.listAllPosts.useQuery()

  const upsertStrategy = trpc.strategy.upsertStrategy.useMutation()
  const upsertPositions = trpc.position.upsert.useMutation()
  const upsertTrades = trpc.trade.upsert.useMutation()

  const deletePosition = trpc.position.delete.useMutation()
  const deleteTrade = trpc.trade.delete.useMutation()

  const { data: selectedStrategy } = trpc.strategy.getById.useQuery(selectedStrategyId, { enabled: !!selectedStrategyId });

  const form = useForm<FormValues>({
    resolver: zodResolver(StrategySchema),
    defaultValues: dfl_form_vals,
  });

  const [delPosArray, setDelPosArray] = React.useState<string[]>([]);
  const [addedPosArray, setAddedPosArray] = React.useState<string[]>([]);
  const [delTradeArray, setDelTradeArray] = React.useState<string[]>([]);
  const [addedTradeArray, setAddedTradeArray] = React.useState<string[]>([]);

  // Position handlers
  const handleAddPositionToDelete = (posId: string) => {
    setDelPosArray(prev => [...prev, posId]);
  };

  const handleRemovePositionFromAdded = (posId: string) => {
    setAddedPosArray(prev => prev.filter(id => id !== posId));
  };

  const handleAddPosToAdded = (ele : string) => {
    setAddedPosArray(prev => [...prev, ele])
  }

  // Trade handlers
  const handleAddTradeToDelete = (tradeId : string) => {
    setDelTradeArray(prev => [...prev, tradeId]);
  };

  const handleRemoveTradeFromAdded = (tradeId : string) => {
    setAddedTradeArray(prev => prev.filter(id => id !== tradeId));
  };

  const handleAddTradeToAdded = (tradeId : string) => {
    setAddedTradeArray(prev => [...prev, tradeId])
  }
  
  const onSubmit = async (data: FormValues) => {
    console.log(data)
    if(data.post?.id === "NA") {
      console.log("Strategy must associate to a post")
      return
    }

    if(selectedStrategyId != null && data.post?.id != selectedStrategy?.post?.id) {
      console.log("Switch posts for strategy in Post tab")
      return
    }

    const strat_id = selectedStrategyId ? selectedStrategyId : nanoid();
    console.log(">>>",strat_id)

    const payload : UpsertStrategyInputSchema = {
      id: strat_id,
      name: data.name,
      description: data.description,
      category: data.category ?? "INCOME",
      timeframe: data.timeframe ?? "WEEKLY",
      riskProfile: data.riskProfile ?? "LOW",
      status: data.status ?? "ACTIVE",
      post: { id: data.post?.id ? data.post?.id : null}
    };
    const res = await upsertStrategy.mutateAsync(payload);
    console.log(res)

    //console.log(delTradeArray)
    if(delTradeArray.length > 0) {
      delTradeArray.map(async (trade_id) => {
        await deleteTrade.mutateAsync(trade_id)
      })
      setDelTradeArray([])
    }

    //console.log(delPosArray)
    if(delPosArray.length > 0) {
      delPosArray.map(async (pos_id) => {
        await deletePosition.mutateAsync(pos_id)
      })
      setDelPosArray([])
    }

    const upsert_pos_payload  = data.positions.map(((pos) => {
      return {
        positionId: pos.id,
        strategyId: strat_id,
        underlying: pos.underlying,
        openedAt: pos.openedAt,
        capitalUsed: pos.capitalUsed,
        status: pos.status,
        notes: pos.notes,
      }
    }))

    if (upsert_pos_payload.length > 0) {
      const res = await upsertPositions.mutateAsync(upsert_pos_payload as UpdatePositionSchema[])
      console.log(res)
    }

    // flatMap flattens the inner arrays into one level.
    // filter ensures only valid trades are mapped.
    const upsert_trades_payload = data.positions.flatMap((pos) =>
      pos.trades.map((trade) => ({
          date: trade.date,
          direction: trade.direction,
          orderType: trade.orderType,
          status: trade.status,
          quantity: trade.quantity,
          positionId: pos.id,
          tradeId: trade.id,
        }))
    );

    if(upsert_trades_payload.length > 0) {
      const res = await upsertTrades.mutateAsync(upsert_trades_payload as UpdateTradeSchema[])
      console.log(res)
    }
  }

  /* ======= Form Handlers ======= */
  const { fields: positionFields, append: appendPosition, remove: removePosition } = useFieldArray({
    control : form.control,
    name: "positions",
  });
  
  // Update form when selectedStrategy changes
  React.useEffect(() => {
  if (selectedStrategy) {
    setIsEditMode(true);

    const adaptedStrategy = {
      ...selectedStrategy,
      createdAt: new Date(selectedStrategy.createdAt),
      positions: selectedStrategy.positions.map((pos) => ({
        ...pos,
        openedAt: new Date(pos.openedAt),
        trades: pos.trades.map((trade) => ({
          ...trade,
          date: new Date(trade.date) 
        })),
      })),
    };

    form.reset(adaptedStrategy);
    setSelectedStrategy_snap(form.watch())
  }
}, [selectedStrategy]);

  const addPosition = () => {
    const pos_id = nanoid()
    appendPosition({...dfl_form_vals.positions[0], id: pos_id})
    handleAddPosToAdded(pos_id) // addedPosArray.push(pos_id)
  }

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
        <TabsTrigger value="editor" className="cursor-pointer">Edit</TabsTrigger>
        <TabsTrigger value="preview" className="cursor-pointer">Preview</TabsTrigger>
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
                              {posts?.find((p) => p.id === field.value)?.title ||
                                "Select Post"}
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuLabel>Posts</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuRadioGroup
                              value={field.value ?? undefined}
                              onValueChange={(value) => field.onChange(value)}
                            >
                              {posts?.map((p) => (
                                <DropdownMenuRadioItem
                                  key={p.id}
                                  value={p.id}
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
                        className="max-w-40 justify-start cursor-pointer"
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
                        onValueChange={setSelectedStrategyId}
                      >
                        {strategies?.map((strat) => (
                          <DropdownMenuRadioItem
                            key={strat.id}
                            value={strat.id}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">{strat.id}</span>
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
                    <Button variant="default" size="sm" onClick={handleNewStrat} type="button" className="cursor-pointer">
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
                            <Button variant="outline" className="cursor-pointer">
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
                          <Button variant="outline" className="cursor-pointer">
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
                          <Button variant="outline" className="cursor-pointer">
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
                          <Button variant="outline" className="cursor-pointer">
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
                        type="button"
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
                    watch={form.watch}
                    position={position}
                    positionIndex={positionIndex}
                    control={form.control}
                    removePosition={removePosition}
                    addedPosArray={addedPosArray}
                    addedTradeArray={addedTradeArray}
                    handleAddPositionToDelete={handleAddPositionToDelete}
                    handleRemovePositionFromAdded={handleRemovePositionFromAdded}
                    handleAddTradeToDelete={handleAddTradeToDelete}
                    handleRemoveTradeFromAdded={handleRemoveTradeFromAdded}
                    handleAddTradeToAdded={handleAddTradeToAdded}
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
          <CardContent className="flex flex-col gap-y-4">
            {preview.description}
            <Card>
              <CardHeader>
                <CardTitle> Positions </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-y-2">
                <Table>
                  <TableHeader>
                    <TableRow> 
                      <TableHead> </TableHead>
                      <TableHead className="w-[100px]"> Underlying </TableHead>
                      <TableHead> Open Date </TableHead>
                      <TableHead> Capital </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.positions.map((pos) => (
                      <PositionTradesRow key={pos.id} position={pos} />
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

function PositionsTradesEditorRow(
  {control, 
    watch,
    positionIndex, 
    removePosition, 
    addedPosArray,
    addedTradeArray,
    handleAddTradeToAdded,
    handleAddTradeToDelete,
    handleRemoveTradeFromAdded,
    handleAddPositionToDelete,
    handleRemovePositionFromAdded} : PositionsTradesEditorRowProps ) {
  const [open, setOpen] = React.useState(false)

  const { fields: tradeFields, append: appendTrade, remove : removeTrade } = useFieldArray({
    control,
    name: `positions.${positionIndex}.trades`,
  });

  const addTrade = () => {
    const trade_id = nanoid()
    appendTrade({...dfl_form_vals.positions[0].trades[0], id: trade_id});
    handleAddTradeToAdded(trade_id) 
  };

  const handleDeletePosition = async (form_idx : number) => {
    const pos_id_to_delete : string = watch().positions[form_idx].id

    const ele = addedPosArray.find((ele : string) => {
      return ele == pos_id_to_delete
    }) 
    //if the added position has not been added manually, delet from remote DB
    if(ele == null) {
      handleAddPositionToDelete(pos_id_to_delete) //delPosArray.push(pos_id_to_delete)
    }else{
      handleRemovePositionFromAdded(ele) // addedPosArray.pop(ele)
    }
    removePosition(form_idx)
  }

  const handleDeleteTrade = async (form_idx : number) => {
    const trade_id : string = watch().positions[positionIndex].trades[form_idx].id

    const ele = addedTradeArray.find((ele : string) => {
      return ele == trade_id
    }) 
    if(ele == null) {

      handleAddTradeToDelete(trade_id) //delTradeArray.push({pos_id : pos_id, trade_id : trade_id})
    }else{
      // if trade we're deleting is one we've added, then it won't be added
      handleRemoveTradeFromAdded(ele) // addedPosArray.pop(ele)
    }
    removeTrade(form_idx)
  }
  
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
        <TableCell className="text-sm">
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
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <Input {...field} 
                    type="number" 
                    step="any" 
                    onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === "" ? 0 : e.target.valueAsNumber);
                  }}
                />
              </Field>
            )}
          />
        </TableCell>

        <TableCell>
          <Button 
            variant="ghost" 
            className="cursor-pointer text-red-500 hover:text-red-600"
            onClick={() => handleDeletePosition(positionIndex)}
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
              type="button"
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
                            checked={field.value === "LONG"}
                            onCheckedChange={(checked) =>
                              field.onChange(checked ? "LONG" : "SHORT")
                            }
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
                          type="button"
                          className="cursor-pointer text-red-500 hover:text-red-600"
                          onClick={() => handleDeleteTrade(tradeIndex)}
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
