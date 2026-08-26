import { redirect } from "next/navigation";
import { AuthFooterLink, AuthScreen } from "@/components/auth/screen";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { getSession } from "@/lib/session";

export default async function SignUpPage() {
  if (await getSession()) redirect("/");

  return (
    <AuthScreen
      description="Your todos stay private to this account."
      footer={
        <AuthFooterLink
          href="/sign-in"
          label="Sign in"
          prompt="Already have an account?"
        />
      }
      title="Create an account"
    >
      <SignUpForm />
    </AuthScreen>
  );
}
