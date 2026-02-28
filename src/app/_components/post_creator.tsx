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
import { BlogPostSchema, CreatePostInputSchema, PostTypeEnum } from "@/schemas/blog"
import { trpc } from "../_trpc/client"
import { ChevronDown, Trash } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import Link from "next/link"

const formSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  content: z.string(),
  seoTitle: z.string(),
  seoDescription: z.string(),
  type: PostTypeEnum,
  link: z.string(),
})

const dfl_form_vals = {
  id: nanoid(),
  title: "",
  summary: "",
  content: "",
  seoTitle: "",
  seoDescription: "",
  type: "GENERIC" as const,
  link: "",
};

export function PostCreator() {
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [selectedPostId, setSelectedPostId] = React.useState<string | null>(null);
  const [preview, setPreview] = React.useState<z.infer<typeof formSchema> | null>(null)

  const {data: strategies, isLoading: strategiesLoading, isError: strategiesError} = trpc.strategy.listAll.useQuery()
  const {data: posts, isLoading: postsLoading, isError: postsError, refetch : refetchPosts} = trpc.blog.listAllPosts.useQuery()
  const upsertPost = trpc.blog.upsertPost.useMutation();
  const swapStrategies = trpc.blog.swapStrategies.useMutation();
  const deletePost = trpc.blog.delete.useMutation();
  const { data: selectedPost, isLoading : selectedPostLoading, isError : selectedPostError} = trpc.blog.getPostById.useQuery(selectedPostId, { enabled: !!selectedPostId });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: dfl_form_vals,
  })
  const { watch } = form;

  const onSubmit = async (data: z.infer<typeof formSchema>, mode : "upsert" | "delete") => {
    console.log(data)

    if(selectedPostId != null && mode == "delete") {
      await deletePost.mutateAsync(selectedPostId)
      return
    }

    const slug = `${data.title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "")}-${nanoid(5)}`;


   const post_id = selectedPostId ?? nanoid();
    const payload : CreatePostInputSchema = {
      id: post_id,
      slug: slug,
      title: data.title,
      summary: data.summary,
      content: data.content,
      type: data.type,
      seoTitle: data.seoTitle, // TODO remove this attr in schema
      seoDescription: data.seoDescription,
      strategy: { id: null }, 
      link: data.link,
    };
    const res = await upsertPost.mutateAsync(payload);
    console.log(`upsertPost() returned: ${res}`)

    refetchPosts()
    form.reset(dfl_form_vals)
    setSelectedPostId(null)
  }

  React.useEffect(() => {
    if (selectedPost) {
      setIsEditMode(true);
      form.setValue('id', selectedPost.id);
      form.setValue('title', selectedPost.title);
      form.setValue('summary', selectedPost.summary);
      form.setValue('content', selectedPost.content);
      form.setValue('seoTitle', selectedPost.seoTitle);
      form.setValue('seoDescription', selectedPost.seoDescription);
      form.setValue('link', selectedPost.link)
      form.setValue('type', selectedPost.type)
    }
  }, [selectedPost, form]);

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

  const handleDeletePost = async () => {
    await form.handleSubmit((data) => onSubmit(data, "delete"))();

    setSelectedPostId(null);
    setIsEditMode(false);
    refetchPosts();
  };

  return (
    <Tabs defaultValue="editor" className="max-w-3/4">
      <TabsList>
        <TabsTrigger value="editor" className="cursor-pointer">Edit</TabsTrigger>
        <TabsTrigger value="preview" className="cursor-pointer">Preview</TabsTrigger>
      </TabsList>
      <TabsContent value="editor">
        <form id="rhf-post" onSubmit={form.handleSubmit((data) => onSubmit(data, "upsert"))} className="w-full max-w-3xl">
          <Card className="gap-y-2">
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <CardTitle>
                  {isEditMode ? "Edit blog post" : "Create blog post"}
                </CardTitle>
                <div className="flex items-center gap-2">

                  {/* Post Selector for Editing */}
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
                        onValueChange={setSelectedPostId}
                      >
                        {posts?.map((post) => (
                          <DropdownMenuRadioItem
                            key={post.id}
                            value={post.id}
                            className="cursor-pointer"
                          >
                            <div className="flex flex-col">
                              <span className="text-left font-medium">{post.title}</span>
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
                    <div className="flex items-center">
                    <Button variant="default" size="sm" type="button" onClick={handleNewPost} >
                      New Post
                    </Button>
                    <Button 
                      variant="ghost" 
                      type="button"
                      className="cursor-pointer text-red-500 hover:text-red-600"
                      onClick={handleDeletePost}
                    >
                      <Trash className="w-4 h-4"/>
                    </Button>
                    </div>
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

                {/* Link */}
                <Controller
                  name="link"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} >
                      <FieldLabel className="w-24">
                        Link
                      </FieldLabel>
                      <Input
                        {...field}
                        id="rhf-post-link"
                        placeholder=""
                        autoComplete="off"
                      />
                    </Field>
                  )}
                />

                  {/* Post TYPE */}
                <Controller
                  name="type"
                  control={form.control}
                  render={({ field }) => (
                    <div className="max-w-40 truncate">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="cursor-pointer">
                            {field.value ?? "Select Type"}
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuSeparator />
                          <DropdownMenuRadioGroup
                            value={field.value?.toString() ?? ""}
                            onValueChange={(value) => field.onChange(value)}
                          >
                            {PostTypeEnum.options?.map((ele) => (
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

                {/* SEO Description */}
                <Controller
                  name="seoDescription"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>
                        SEO Description
                      </FieldLabel>
                      <InputGroup>
                        <InputGroupTextarea
                          {...field}
                          placeholder=""
                          id="rhf-post-seoDescription"
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
                      <FieldLabel>
                        Content
                      </FieldLabel>
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
      {preview && <Card>
        {preview.type != 'NOTEBOOK' && (<CardHeader>
            <CardTitle className="">
              {preview.title}
            </CardTitle>
            <CardDescription>
              {preview.summary}
            </CardDescription>
          </CardHeader>)}
          <CardContent>
            {preview.type != 'NOTEBOOK' && (
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
            </section>)}
            {/* TODO:  The jupyter notebook is stored locally */}
            {preview.type == 'NOTEBOOK' && (
              <iframe src={preview.link} className="w-full h-screen"/>
            )}
          </CardContent>
          <CardFooter>
          </CardFooter>
        </Card>}
      </TabsContent>
    </Tabs>
  );
}

