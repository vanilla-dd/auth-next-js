"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { AuthTextField } from "@/components/auth/text-field";
import { Button } from "@/components/ui/button";
import { FieldError, FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
import { type SignUpValues, signUpSchema } from "@/lib/auth-schemas";

export function SignUpForm() {
  const router = useRouter();
  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  async function onSubmit(values: SignUpValues) {
    form.clearErrors("root");
    const { error } = await authClient.signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
      callbackURL: "/",
    });

    if (error) {
      form.setError("root", {
        message:
          error.message ||
          "Could not create an account. Try a different email.",
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
          autoComplete="name"
          control={form.control}
          label="Name"
          maxLength={80}
          name="name"
          type="text"
        />
        <AuthTextField
          autoComplete="email"
          control={form.control}
          label="Email"
          name="email"
          type="email"
        />
        <AuthTextField
          autoComplete="new-password"
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
        Create account
      </Button>
    </form>
  );
}
