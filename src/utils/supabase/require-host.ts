import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

export const LOGIN_PATH = "/login";

export async function requireHost(): Promise<User> {
  let user: User | null = null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();

    if (!error) {
      user = data.user;
    }
  } catch {
    user = null;
  }

  if (!user) {
    redirect(LOGIN_PATH);
  }

  return user;
}
