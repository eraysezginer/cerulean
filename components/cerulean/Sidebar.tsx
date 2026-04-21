import { Building2 } from "lucide-react";
import { NavGroup } from "./NavGroup";
import { NavItem } from "./NavItem";
import { PortfolioCompanyNav } from "./PortfolioCompanyNav";
import { SidebarDefaultCompanyLabel } from "./SidebarDefaultCompanyLabel";

export function Sidebar() {
  return (
    <aside className="fixed bottom-0 left-0 top-14 z-40 flex w-[220px] flex-col overflow-hidden border-r border-border bg-gradient-to-b from-bg-2 to-bg-2/95">
      <div className="border-b border-border/80 px-3 py-3.5">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-bg text-teal shadow-sm">
            <Building2 className="h-4 w-4" strokeWidth={2} />
          </span>
          <div className="min-w-0 pt-0.5">
            <div className="text-sidebar-brand leading-snug text-text-1">
              Demo portfolio
            </div>
            <SidebarDefaultCompanyLabel />
          </div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-0 pb-6 pt-2">
        <NavGroup label="Overview">
          <NavItem href="/dashboard" label="Dashboard" />
        </NavGroup>
        <NavGroup label="Portfolio">
          <NavItem href="/companies" label="All companies" />
          <PortfolioCompanyNav />
          <NavItem href="/companies/new/check" label="Pre-investment check" />
        </NavGroup>
        <NavGroup label="Flags">
          <NavItem href="/flags/active" label="Active flags" />
          <NavItem href="/flags/history" label="Flag history & timeline" />
        </NavGroup>
        <NavGroup label="Reports">
          <NavItem href="/reports/lp" label="LP report" />
          <NavItem href="/reports/board" label="Board meeting brief" />
          <NavItem href="/reports/exit" label="Exit readiness" />
        </NavGroup>
        <NavGroup label="Integrations">
          <NavItem href="/integrations" label="Connected sources" />
        </NavGroup>
        <NavGroup label="Settings">
          <NavItem href="/settings/alerts" label="Alerts & delivery" />
          <NavItem href="/settings/compliance" label="Compliance & audit" />
        </NavGroup>
      </nav>
    </aside>
  );
}
