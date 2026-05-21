"use client"

import * as z from "zod";
import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/link";

import { Suspense } from "react";

const loginSchema = z.object({
  verifier_code: z.string().min(1, "verifier code required"),
});
type LoginFormValues = z.infer<typeof loginSchema>;

export default function loginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginETRADEPage />
    </Suspense>
  );
}

export function LoginETRADEPage() {
  const [isConnected, setIsConnected] = React.useState<boolean>(false)
  const params = useSearchParams();
  const authorizeUrl = params.get("authorizeUrl");

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { verifier_code: "" },
  });

  const [error, setError] = React.useState<string>("");
  const router = useRouter()

  const onSubmit = async (data: LoginFormValues) => {
    try {
      // Browsers automatically include cookies for same-origin requests.
      const res = await fetch("/api/etrade/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Incorrect password");

      const resp = await res.json()
      if (resp.success) router.push("/admin");
    } catch (error: any) {
      setError("Incorrect password");
    }
  };

  async function handleConnectETRADE() {
    setIsConnected(true)
    window.open(authorizeUrl ?? "", "_blank", "noopener,noreferrer");
  }

  if(!isConnected) {
    return (
      <main className="flex items-center justify-center w-full h-screen">
        <Card className="min-w-100">
          <CardHeader>
            <CardTitle>Authorize E*TRADE account</CardTitle>
          </CardHeader>
          <CardContent>
            <Button type="button" onClick={handleConnectETRADE} className="cursor-pointer">
              Connect
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }else{
    return (
      <main className="flex items-center justify-center w-full h-screen">
        <Card className="min-w-100">
          <CardHeader>
            <CardTitle>E*TRADE Access Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form id="login-form" onSubmit={form.handleSubmit(onSubmit)}>
              <FieldGroup>
                <Controller
                  name="verifier_code"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="password">Code </FieldLabel>
                      <Input
                        {...field}
                        id="verifier_code"
                        type="password"
                        placeholder="Enter Code"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </FieldGroup>
            </form>
          </CardContent>
          <CardFooter>
            <Button type="submit" form="login-form" className="cursor-pointer" >
              Enter
            </Button>
          </CardFooter>
        </Card>
      </main>
    );
  }
}


