"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import * as z from "zod"

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
import { ChevronDown, Table } from "lucide-react"
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
import { TableHead, TableHeader, TableRow } from "@/components/ui/table"

const formSchema = z.object({
  name: z.string(),
  description: z.string(),
  category: StrategyCategoryEnum.nullable(),
  timeframe: TimeframeEnum.nullable(),
  riskProfile: RiskProfileEnum.nullable(),
  status: StrategyStatusEnum.nullable(),
  postId: z.number().nullable(),
})

const dfl_form_vals : z.infer<typeof formSchema>= {
  name: "",
  description: "",
  category: null,
  timeframe: null,
  riskProfile: null,
  status: null,
  postId: null,
};

export function StrategyCreator() {
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [selectedStrategyId, setSelectedStrategyId] = React.useState<number | null>(null);
  const [preview, setPreview] = React.useState<z.infer<typeof formSchema> | null>(null)

  const {data: strategies, isLoading: strategiesLoading, isError: strategiesError} = trpc.strategy.listAll.useQuery()
  const {data: posts, isLoading: postsLoading, isError: postsError} = trpc.blog.listAllPosts.useQuery()
  const upsertStrategy = trpc.strategy.upsertStrategy.useMutation()
  const { data: selectedStrategy, isLoading : selectedStrategyLoading, isError : selectedStrategyError} =
    trpc.strategy.getById.useQuery(selectedStrategyId, {
      enabled: !!selectedStrategyId, // only fetch if id is not null
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...dfl_form_vals
    },
  })
  const { watch } = form;

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if(data.postId === null) {
      toast("Strategy must associate to a post")
      return
    }

    if(data.postId != selectedStrategy?.post.id) {
      console.log("Switch posts for strategy in Post tab")
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
        <form id="rhf-strat" onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-3xl">
          <Card className="gap-y-2">
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <CardTitle>
                  {isEditMode ? "Edit strategy" : "Create strategy"}
                </CardTitle>
                <div className="flex items-center gap-2">

                  {/* Post Selector */}
                  {!isEditMode && (<Controller
                    name="postId"
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
                          className="min-h-20 resize-none"
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
              <CardFooter>
                <div className="flex items-center gap-2">
                  <Field orientation="horizontal">
                    <Button type="submit" form="rhf-strat" className="cursor-pointer">
                      Publish
                    </Button>
                  </Field>
                  <Button type="button" className="cursor-pointer" onClick={handleSavePreview}>
                    Save Preview
                  </Button>
                </div>
              </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle> Positions </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-y-2">
            {/*<Table>
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
              </Table>*/}
            </CardContent>
          </Card>
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
          </CardContent>
        </Card>}
      </TabsContent>
    </Tabs>
  );
}
