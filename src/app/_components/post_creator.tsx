"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import * as z from "zod"
import { nanoid } from "nanoid";

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

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

const formSchema = z.object({
  title: z.string(),
  summary: z.string(),
  content: z.string(),
  seoTitle: z.string(),
  seoDescription: z.string(),
  strategyId: z.number().nullable(),
})

const dfl_form_vals = {
  title: "",
  summary: "",
  content: "",
  seoTitle: "",
  seoDescription: "",
  strategyId: null,
};

export function PostCreator() {
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [selectedPostId, setSelectedPostId] = React.useState<number | null>(null);
  const [preview, setPreview] = React.useState<z.infer<typeof formSchema>>({
    ...dfl_form_vals
  })

  const {data: strategies, isLoading: strategiesLoading, isError: strategiesError} = trpc.strategy.listAll.useQuery()
  const {data: posts, isLoading: postsLoading, isError: postsError} = trpc.blog.listAllPosts.useQuery()
  const upsertPost = trpc.blog.upsertPost.useMutation();
  const swapStrategies = trpc.blog.swapStrategies.useMutation();
  const { data: selectedPost, isLoading : selectedPostLoading, isError : selectedPostError} =
    trpc.blog.getPostById.useQuery(selectedPostId, {
      enabled: !!selectedPostId, // only fetch if id is not null
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...dfl_form_vals
    },
  })
  const { watch } = form;

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const slug = `${data.title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "")}-${nanoid(5)}`;

    if(selectedPost && 
       // selected post to edit has a valid strat
       selectedPost.strategy.id != null &&  
       // selected strategy already is associated to another post
       data.strategyId != selectedPost?.strategy?.id &&
       (selectedPost.id != null && data.strategyId != null)) {
      console.log("switching strategies for post")
      const payload = {
        postA_id: selectedPost.id,
        stratB_id : data.strategyId
      }
      const res = await swapStrategies.mutateAsync(payload)
      console.log(res)
    }

    const payload : CreatePostInputSchema = {
      id: selectedPostId,
      slug: slug,
      title: data.title,
      summary: data.summary,
      content: data.content,
      type: data.strategyId ? "STRATEGY" : "GENERIC",
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      strategy: { id: data.strategyId ?? null }, 
    };
    const res = await upsertPost.mutateAsync(payload);
    console.log(`upsertPost() returned: ${res}`)
    setPreview(watch()) //update preview
  }

  React.useEffect(() => {
    if (selectedPost) {
      setIsEditMode(true);

      form.setValue('title', selectedPost.title);
      form.setValue('summary', selectedPost.summary);
      form.setValue('content', selectedPost.content);
      form.setValue('strategyId', selectedPost.strategy.id);
      form.setValue('seoTitle', selectedPost.seoTitle);
      form.setValue('seoDescription', selectedPost.seoDescription);
    }
  }, [selectedPost, form]);

  const handlePostSelection = async (value: string) => {
    const id = Number(value);
    setSelectedPostId(id);
  };

  const handleNewPost = () => {
    setSelectedPostId(null);
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
        <form id="rhf-post" onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-3xl">
          <Card className="gap-y-2">
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <CardTitle>
                  {isEditMode ? "Edit blog post" : "Create blog post"}
                </CardTitle>
                <div className="flex items-center gap-2">
                
                  {/* Strategy Selector */}
                  <Controller
                    name="strategyId"
                    control={form.control}
                    render={({ field }) => (
                      <div className="max-w-40 truncate">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                              {strategies?.find((s) => s.id === Number(field.value))?.name ||
                                "Select Strategy"}
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuLabel>Strategies</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuRadioGroup
                              value={field.value?.toString() ?? ""}
                              onValueChange={(value) => field.onChange(Number(value))}
                            >
                              {strategies?.map((strategy) => (
                                <DropdownMenuRadioItem
                                  key={strategy.id}
                                  value={strategy.id.toString()}
                                >
                                  {strategy.name}
                                </DropdownMenuRadioItem>
                              ))}
                            </DropdownMenuRadioGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  />

                  {/* Post Selector for Editing */}
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
                          ? posts?.find((p) => p.id === selectedPostId)?.title ||
                            "Select Post"
                          : "Edit Existing"}
                        </span>
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-72">
                      <DropdownMenuLabel>Select Post to Edit</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuRadioGroup
                        value={selectedPostId?.toString() ?? ""}
                        onValueChange={handlePostSelection}
                      >
                        {posts?.map((post) => (
                          <DropdownMenuRadioItem
                            key={post.id}
                            value={post.id.toString()}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">{post.title}</span>
                              <span className="text-xs text-muted-foreground">
                                {post.summary.slice(0, 50)}...
                              </span>
                            </div>
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {isEditMode && (
                    <Button variant="default" size="sm" onClick={handleNewPost} type="button">
                      New Post
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                {/* Title */}
                <Controller
                  name="title"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} >
                      <FieldLabel className="w-24">
                        Title
                      </FieldLabel>
                      <Input
                        {...field}
                        id="rhf-post-title"
                        //aria-invalid={fieldState.invalid}
                        placeholder=""
                        autoComplete="off"
                      />
                    </Field>
                  )}
                />

                {/* Summary */}
                <Controller
                  name="summary"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>
                        Summary
                      </FieldLabel>
                      <InputGroup>
                        <InputGroupTextarea
                          {...field}
                          placeholder=""
                          id="rhf-post-summary"
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

                {/* Content */}
                <Controller
                  name="content"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <InputGroup>
                        <InputGroupTextarea
                          {...field}
                          placeholder=""
                          id="rhf-post-content"
                          rows={4}
                          className="min-h-50 resize-none"
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
                  <Button type="submit" form="rhf-post" className="cursor-pointer">
                    Publish
                  </Button>
                </Field>
                <Button type="button" className="cursor-pointer" onClick={handleSavePreview}>
                  Save Preview
                </Button>
              </div>
            </CardFooter>
          </Card>
        </form>
      </TabsContent>
      <TabsContent value="preview">
        <Card>
          <CardHeader>
            <CardTitle className="">
              {preview.title}
            </CardTitle>
            <CardDescription>{preview.summary}</CardDescription>
          </CardHeader>
          <CardContent>
            <section>
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[
                  rehypeRaw,
                  rehypeSanitize,
                  rehypeHighlight,
                  rehypeSlug,
                  rehypeKatex,
                  rehypeAutolinkHeadings,
                ]}
              >
                {preview.content}
              </ReactMarkdown>
            </section>
          </CardContent>
          <CardFooter>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

