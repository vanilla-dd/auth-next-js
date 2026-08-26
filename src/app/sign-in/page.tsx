import { redirect } from "next/navigation";
import { AuthFooterLink, AuthScreen } from "@/components/auth/screen";
import { SignInForm } from "@/components/auth/sign-in-form";
import { DEMO_USER } from "@/lib/auth-schemas";
import { getSession } from "@/lib/session";

export default async function SignInPage() {
  if (await getSession()) redirect("/");

  return (
    <AuthScreen
      description={`Demo account is prefilled: ${DEMO_USER.email} / ${DEMO_USER.password}`}
      footer={
        <AuthFooterLink
          href="/sign-up"
          label="Create one"
          prompt="No account?"
        />
      }
      title="Sign in"
    >
      <SignInForm />
    </AuthScreen>
  );
}
