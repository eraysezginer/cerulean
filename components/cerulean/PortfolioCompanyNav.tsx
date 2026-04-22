"use client";

import { NavItem } from "@/components/cerulean/NavItem";
import { useDefaultCompanyId } from "@/hooks/use-default-company-id";

export function PortfolioCompanyNav() {
  const companyId = useDefaultCompanyId();

  return (
    <>
      <NavItem
        href={`/companies/${companyId}/flags`}
        label="Company: flags"
        isActiveMatch={(p) => /\/companies\/[^/]+\/flags$/.test(p)}
      />
      <NavItem
        href={`/companies/${companyId}/upload`}
        label="Company: upload file"
        isActiveMatch={(p) => /\/companies\/[^/]+\/upload$/.test(p)}
      />
      <NavItem
        href={`/companies/${companyId}/timeline`}
        label="Company: document timeline"
        isActiveMatch={(p) => /\/companies\/[^/]+\/timeline$/.test(p)}
      />
      <NavItem
        href={`/companies/${companyId}/behavioral`}
        label="Company: behavioral"
        isActiveMatch={(p) => /\/companies\/[^/]+\/behavioral$/.test(p)}
      />
      <NavItem
        href={`/companies/${companyId}/external`}
        label="Company: external signals"
        isActiveMatch={(p) => /\/companies\/[^/]+\/external$/.test(p)}
      />
      <NavItem
        href={`/companies/${companyId}/captable`}
        label="Company: cap table"
        isActiveMatch={(p) => /\/companies\/[^/]+\/captable$/.test(p)}
      />
    </>
  );
}
