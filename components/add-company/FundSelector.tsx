"use client";

import { Folder } from "lucide-react";
import { useMemo } from "react";
import { FUNDS, getFundById } from "@/data/funds";
import { useAddCompany } from "@/contexts/AddCompanyFormContext";
import { FormField, SelectDropdown } from "./ui";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const VEHICLES = [
  "LP Fund",
  "SPV",
  "Rolling fund",
  "Solo GP",
  "Syndicate",
  "Other",
];

export function FundSelector() {
  const { form, setForm, setField, stepErrors } = useAddCompany();

  const isCustomFund = form.fundId?.startsWith("new-fund-");
  const showCreateInline = form.fundId === "__new__";

  const numberHint = useMemo(() => {
    if (!form.fundId || form.fundId === "__new__" || isCustomFund) {
      if (isCustomFund && form.fundName) {
        return `This will be portfolio company #1 in ${form.fundName}.`;
      }
      return null;
    }
    const f = getFundById(form.fundId);
    if (!f) return null;
    const n = f.companiesCount + 1;
    return `This will be portfolio company #${n} in ${f.name}.`;
  }, [form.fundId, form.fundName, isCustomFund]);

  return (
    <div
      className="mb-6 rounded-lg border-2 border-t-[3px] border-border bg-bg-2 p-4"
      style={{ borderTopColor: "#0B7275" }}
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Folder className="h-4 w-4 text-teal" />
          <span className="text-[14px] font-semibold text-text-1">Fund assignment</span>
        </div>
        <span className="rounded-full bg-teal-light px-2 py-0.5 text-[11px] font-medium text-teal">
          Required
        </span>
      </div>
      <p className="text-[12px] text-text-2">
        Associates this company with a fund vehicle for LP reporting and return attribution.
      </p>

      {showCreateInline ? (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <FormField
              label="New fund name"
              placeholder="e.g. Fund IV (2025)"
              value={form.newFundName}
              onChange={(v) => setField("newFundName", v)}
              error={stepErrors.newFundName}
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              className="h-8 bg-bg-3 text-[13px] text-text-2"
              onClick={() => setForm({ fundId: "", newFundName: "" })}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="h-8 bg-teal text-[13px] text-primary-foreground"
              onClick={() => {
                if (!form.newFundName.trim()) return;
                setForm({
                  isNewFund: true,
                  fundName: form.newFundName.trim(),
                  fundId: `new-fund-${Date.now()}`,
                });
              }}
            >
              Save fund
            </Button>
          </div>
        </div>
      ) : null}

      {!showCreateInline && (
        <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-[3fr_1fr_1fr]">
          <div>
            <label className="text-[13px] font-medium text-text-1">Fund</label>
            {isCustomFund ? (
              <div className="mt-0.5 flex items-center justify-between gap-2 rounded-md border border-border bg-bg px-2 py-1.5 text-[13px] text-text-1">
                <span className="truncate font-medium">{form.fundName || "—"}</span>
                <button
                  type="button"
                  className="shrink-0 text-teal underline"
                  onClick={() =>
                    setForm({ fundId: "", fundName: "", isNewFund: false, newFundName: "" })
                  }
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="relative mt-0.5">
                <select
                  value={form.fundId}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "__new__") {
                      setForm({ fundId: "__new__", isNewFund: false, newFundName: "" });
                      return;
                    }
                    if (!v) {
                      setForm({ fundId: "", fundName: "" });
                      return;
                    }
                    const f = getFundById(v);
                    setForm({
                      fundId: v,
                      fundName: f?.name ?? "",
                      vintageYear: f?.vintage ?? "",
                      vehicleType: f?.vehicle ?? "LP Fund",
                    });
                  }}
                  className={cn(
                    "h-8 w-full appearance-none rounded-md border border-border bg-bg px-2 pr-7 text-[13px] text-text-1",
                    "focus:outline-none focus:ring-2 focus:ring-teal/30"
                  )}
                >
                  <option value="">Select fund...</option>
                  <option disabled>── Active funds ──</option>
                  {FUNDS.filter((x) => x.vehicle === "LP Fund").map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.vintage} vintage · {f.size}
                      {f.id === "fund-3" ? " · active deployment" : ""})
                    </option>
                  ))}
                  <option disabled>── SPVs ──</option>
                  {FUNDS.filter((x) => x.vehicle === "SPV").map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.vintage} · {f.size})
                    </option>
                  ))}
                  <option disabled>── Other ──</option>
                  <option value="__new__">+ Create new fund...</option>
                </select>
                <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-text-3">
                  ▾
                </span>
              </div>
            )}
            {stepErrors.fundId ? (
              <p className="mt-0.5 text-[13px] text-red">{stepErrors.fundId}</p>
            ) : null}
          </div>
          <SelectDropdown
            label="Vehicle type"
            options={VEHICLES.map((v) => ({ value: v, label: v }))}
            value={form.vehicleType}
            onChange={(v) => setField("vehicleType", v)}
          />
          <FormField
            label="Vintage year"
            placeholder="2024"
            value={form.vintageYear}
            onChange={(v) => setField("vintageYear", v)}
          />
        </div>
      )}

      {!showCreateInline && numberHint ? (
        <p className="mt-2 text-[12px] text-text-3">{numberHint}</p>
      ) : null}
    </div>
  );
}
