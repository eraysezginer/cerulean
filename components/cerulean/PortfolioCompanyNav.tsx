"use client";

import { NavItem } from "@/components/cerulean/NavItem";
import { useDefaultCompanyId } from "@/hooks/use-default-company-id";

export function PortfolioCompanyNav() {
  const companyId = useDefaultCompanyId();
  const companyHref = (section: string) =>
    companyId ? `/companies/${companyId}/${section}` : "/companies";

  return (
    <>
      <NavItem
        href={companyHref("flags")}
        label="Company: flags"
        isActiveMatch={(p) => /\/companies\/[^/]+\/flags$/.test(p)}
      />
      <NavItem
        href={companyHref("upload")}
        label="Company: upload file"
        isActiveMatch={(p) => /\/companies\/[^/]+\/upload$/.test(p)}
      />
      <NavItem
        href={companyHref("timeline")}
        label="Company: document timeline"
        isActiveMatch={(p) => /\/companies\/[^/]+\/timeline$/.test(p)}
      />
      <NavItem
        href={companyHref("behavioral")}
        label="Company: behavioral"
        isActiveMatch={(p) => /\/companies\/[^/]+\/behavioral$/.test(p)}
      />
      <NavItem
        href={companyHref("external")}
        label="Company: external signals"
        isActiveMatch={(p) => /\/companies\/[^/]+\/external$/.test(p)}
      />
      <NavItem
        href={companyHref("captable")}
        label="Company: cap table"
        isActiveMatch={(p) => /\/companies\/[^/]+\/captable$/.test(p)}
      />
    </>
  );
}
