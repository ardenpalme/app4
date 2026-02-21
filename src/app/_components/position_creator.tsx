"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "@formkit/tempo"

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
import { ChevronDown } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { CreateStrategyInputSchema, RiskProfileEnum, StrategyCategoryEnum, StrategyStatusEnum, TimeframeEnum } from "@/schemas/strategy"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { PositionSchema, TradeSchema } from "@/schemas/position"

const formSchema = z.object({
  underlying: z.string(),
  openedAt : z.date(),
  closedAt : z.date().optional(),
  capitalUsed : z.number(),
  realizedPnL : z.number().optional(),
  unrealizedPnL : z.number().optional(),
  returnPct : z.number().optional(),
  thesis: z.string().optional(),
  notes: z.string().optional(),
  trades : z.array(TradeSchema),
  strategyId : z.number().nullable(),

})

const dfl_form_vals : z.infer<typeof formSchema>= {
  underlying: "APPL",
  openedAt : new Date(),
  closedAt : new Date(),
  capitalUsed : 100,
  realizedPnL : 0,
  unrealizedPnL : 0,
  returnPct : 0,
  thesis: "",
  notes: "",
  trades : [],
  strategyId : null
};

export function PositionTradeCreator() {
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [preview, setPreview] = React.useState<z.infer<typeof formSchema> | null>(null)
  const [selectedPositionId, setSelectedPositionId] = React.useState<number | null>(null);

  const {data: strategies} = trpc.strategy.listAll.useQuery()
  const {data: positions} = trpc.position.listAll.useQuery()
  const upsertStrategy = trpc.strategy.upsertStrategy.useMutation()
  const updateTrades = trpc.position.updateTrades.useMutation()
  const { data: selectedPosition, isLoading : selectedPositionLoading, isError : selectedPositionError} =
    trpc.position.getById.useQuery(selectedPositionId, {
      enabled: !!selectedPositionId, // only fetch if id is not null
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...dfl_form_vals
    },
  })
  const { watch } = form;

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if(data.strategyId === null) {
      toast("Strategy must associate to a post")
      return
    }
    const payload : CreateStrategyInputSchema = {
      id: selectedPositionId,
      name: data.name,
      description: data.description,
      category: data.category ?? "INCOME",
      timeframe: data.timeframe ?? "WEEKLY",
      riskProfile: data.riskProfile ?? "LOW",
      status: data.status ?? "ACTIVE",
      post: { id: data.postId }, 
    };
    const res = await upsertStrategy.mutateAsync(payload);
    console.log(`upsertStrategy() returned: ${res}`)
  }

  // Update form when selectedPost changes
  React.useEffect(() => {
    if (selectedStrategy) {
      setIsEditMode(true);

      form.setValue('name', selectedStrategy.name);
      form.setValue('description', selectedStrategy.description);
      form.setValue('riskProfile', selectedStrategy.riskProfile);
      form.setValue('timeframe', selectedStrategy.timeframe);
      form.setValue('status', selectedStrategy.status);
      form.setValue('postId', selectedStrategy.post.id);
    }
  }, [selectedStrategy, form]);

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
    setPreview(watch());
  };

  return (
    <Tabs defaultValue="editor" className="max-w-3/4">
      <TabsList>
        <TabsTrigger value="editor">Edit</TabsTrigger>
        <TabsTrigger value="preview">Preview</TabsTrigger>
      </TabsList>
      <TabsContent value="editor">
        <Card className="gap-y-2">
          <form id="rhf-strat" onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-3xl">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle>
                {isEditMode ? "Edit strategy" : "Create strategy"}
              </CardTitle>
              <div className="flex items-center gap-2">

                {/* Post Selector */}
                <Controller
                  name="strategyId"
                  control={form.control}
                  render={({ field }) => (
                    <div className="max-w-40 truncate">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline">
                            {strategies?.find((p) => p.id === Number(field.value))?.name ||
                              "Select Straegy"}
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuLabel>Strategies</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuRadioGroup
                            value={field.value?.toString() ?? ""}
                            onValueChange={(value) => field.onChange(value)}
                          >
                            {strategies?.map((strat) => (
                              <DropdownMenuRadioItem
                                key={strat.id}
                                value={strat.id.toString()}
                              >
                                {strat.name}
                              </DropdownMenuRadioItem>
                            ))}
                          </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                />

                {/* Position Selector for Editing */}
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
                        ? format(positions?.find((s) => s.id === selectedPositionId)?.openedAt, "short", "en") ||
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
                        aria-invalid={fieldState.invalid}
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
                          className="min-h-20 resize-none"
                          aria-invalid={fieldState.invalid}
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
          </form>
          <CardFooter>
            <div className="flex items-center gap-2">
              <Field orientation="horizontal">
                <Button type="submit" form="rhf-strat" className="cursor-pointer">
                  Publish
                </Button>
              </Field>
              <Button className="cursor-pointer" onClick={handleSavePreview}>
                Save Preview
              </Button>
            </div>
          </CardFooter>
        </Card>
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
          </CardContent>
        </Card>}
      </TabsContent>
    </Tabs>
  );
}

function TradeRow({pos} : {pos: PositionSchema }) {
  const [open, setOpen] = useState(false)
  
  return (
    <>
      <TableRow
        className="cursor-pointer hover:bg-muted/50"
        onClick={() => setOpen((prev) => !prev)}
      >
        <TableCell>
          <ChevronDown
            className={`size-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
          />
        </TableCell>
        <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">{format(strat.date, "short", "en")}</TableCell>
        <TableCell className="hidden sm:table-cell font-medium">{strat.underlying}</TableCell>
        <TableCell>{strat.name}</TableCell>
        <TableCell className="hidden sm:table-cell text-right">
          {strat.pnl !== null ? (
            <span className={strat.pnl >= 0 ? "text-green-500" : "text-red-500"}>
              {formatCurrency(strat.pnl)}
            </span>
          ) : (
            <span className="text-muted-foreground">--</span>
          )}
        </TableCell>
        <TableCell className="hidden sm:table-cell">
          <Badge
            variant={
              strat.status === "OPEN"
                ? "default"
                : strat.status === "CLOSED"
                  ? "secondary"
                  : "outline"
            }
          >
            {strat.status}
          </Badge>
        </TableCell>
        <TableCell>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            asChild
            onClick={(e) => e.stopPropagation()}
          >
            <Link href={`/blog/${strat.post.slug}`}>
              <ExternalLink className="size-4" />
              <span className="sr-only">Read trade write-up</span>
            </Link>
          </Button>
        </TableCell>
      </TableRow>
      {open && (
        <tr>
          <td colSpan={9} className="p-0">
            <div className="border-b border-border bg-muted/30 px-6 py-3">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs">Direction</TableHead>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs">Strike</TableHead>
                    <TableHead className="text-xs">Expiry</TableHead>
                    <TableHead className="text-xs text-right hidden sm:table-cell">Contracts</TableHead>
                    <TableHead className="text-xs text-right hidden sm:table-cell">Premium</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {strat.legs.map((leg, i) => (
                    <TableRow key={i} className="hover:bg-transparent">
                      <TableCell className="py-1.5">
                        <Badge variant={leg.direction === "BUY" ? "default" : "secondary"} className="text-xs">
                          {leg.direction}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-1.5 text-sm">{leg.type}</TableCell>
                      <TableCell className="py-1.5 text-sm">{formatCurrency(leg.strike)}</TableCell>
                      <TableCell className="py-1.5 text-sm text-muted-foreground">{format(leg.expiry,"short","en")}</TableCell>
                      <TableCell className="py-1.5 text-sm text-right hidden sm:table-cell">{leg.contracts.length}</TableCell>
                      <TableCell className="py-1.5 text-sm text-right hidden sm:table-cell">{formatCurrency(leg.premium)}</TableCell>
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
