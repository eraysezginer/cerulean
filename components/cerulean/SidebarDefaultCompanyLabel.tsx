"use client";

import { useDefaultCompanyId } from "@/hooks/use-default-company-id";

export function SidebarDefaultCompanyLabel() {
  const id = useDefaultCompanyId();
  const label = id || "Not set";

  return (
    <div className="text-sidebar-tier leading-snug text-text-3">
      Default company · {label}
    </div>
  );
}
