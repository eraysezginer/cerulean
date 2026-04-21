import { NavGroup } from "./NavGroup";
import { NavItem } from "./NavItem";

const DEMO_CO = "kalder";

export function Sidebar() {
  return (
    <aside className="fixed bottom-0 left-0 top-[44px] z-40 w-[220px] overflow-y-auto border-r border-border bg-bg-2">
      <div className="border-b border-border px-3 py-3">
        <div className="text-sidebar-brand text-text-1">Cerulean</div>
        <div className="text-sidebar-tier text-text-3">Standard Tier</div>
      </div>
      <nav className="px-0 pb-6 pt-2">
        <NavGroup label="Overview">
          <NavItem href="/dashboard" label="Dashboard" />
        </NavGroup>
        <NavGroup label="Portfolio">
          <NavItem href="/companies" label="All companies" />
          <NavItem
            href={`/companies/${DEMO_CO}/flags`}
            label="Company: flags"
          />
          <NavItem
            href={`/companies/${DEMO_CO}/behavioral`}
            label="Company: behavioral"
          />
          <NavItem
            href={`/companies/${DEMO_CO}/external`}
            label="Company: external signals"
          />
          <NavItem
            href={`/companies/${DEMO_CO}/captable`}
            label="Company: cap table"
          />
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
