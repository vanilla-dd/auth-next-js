"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { AuthTextField } from "@/components/auth/text-field";
import { Button } from "@/components/ui/button";
import { FieldError, FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
import { DEMO_USER, type SignInValues, signInSchema } from "@/lib/auth-schemas";

export function SignInForm() {
  const router = useRouter();
  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: DEMO_USER.email, password: DEMO_USER.password },
  });

  async function onSubmit(values: SignInValues) {
    form.clearErrors("root");
    const { error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
      callbackURL: "/",
    });

    if (error) {
      form.setError("root", {
        message: "Invalid credentials. Check your email and password.",
      });
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form
      className="flex flex-col gap-5"
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FieldGroup>
        <AuthTextField
          autoComplete="email"
          control={form.control}
          label="Email"
          name="email"
          type="email"
        />
        <AuthTextField
          autoComplete="current-password"
          control={form.control}
          label="Password"
          name="password"
          type="password"
        />
        {form.formState.errors.root ? (
          <FieldError>{form.formState.errors.root.message}</FieldError>
        ) : null}
      </FieldGroup>
      <Button disabled={form.formState.isSubmitting} type="submit">
        {form.formState.isSubmitting ? (
          <Spinner data-icon="inline-start" />
        ) : null}
        Sign in
      </Button>
    </form>
  );
}
