import type { ReactNode } from "react";

import { requireHost } from "@/utils/supabase/require-host";

export default async function HostLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireHost();

  return children;
}
