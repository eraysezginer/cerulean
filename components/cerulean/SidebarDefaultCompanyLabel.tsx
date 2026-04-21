"use client";

import { companies } from "@/data/companies";
import { useDefaultCompanyId } from "@/hooks/use-default-company-id";

export function SidebarDefaultCompanyLabel() {
  const id = useDefaultCompanyId();
  const name = companies.find((c) => c.id === id)?.name ?? id;

  return (
    <div className="text-sidebar-tier leading-snug text-text-3">
      Default company · {name}
    </div>
  );
}
