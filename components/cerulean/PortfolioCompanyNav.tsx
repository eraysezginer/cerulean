"use client";

import { NavItem } from "@/components/cerulean/NavItem";
import { useDefaultCompanyId } from "@/hooks/use-default-company-id";

export function PortfolioCompanyNav() {
  const companyId = useDefaultCompanyId();
  const companyHref = (section: string) =>
    companyId ? `/companies/${companyId}/${section}` : "/companies";
  const flagsHref = companyHref("flags");

  return (
    <>
      <NavItem
        href={flagsHref}
        label="Company: flags"
        isActiveMatch={(p, q) => /\/companies\/[^/]+\/flags$/.test(p) && !q.get("polarity")}
      />
      <NavItem
        href={`${flagsHref}?polarity=negative`}
        label="Negative Flags"
        level={1}
        isActiveMatch={(p, q) => /\/companies\/[^/]+\/flags$/.test(p) && q.get("polarity") === "negative"}
      />
      <NavItem
        href={`${flagsHref}?polarity=positive`}
        label="Positive Flags"
        level={1}
        isActiveMatch={(p, q) => /\/companies\/[^/]+\/flags$/.test(p) && q.get("polarity") === "positive"}
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
