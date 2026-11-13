import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

import ResetPasswordScreen from "./reset-password-screen";

export const metadata: Metadata = {
  title: "Reset password",
};

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/login?reset=invalid");
  }

  return <ResetPasswordScreen />;
}
