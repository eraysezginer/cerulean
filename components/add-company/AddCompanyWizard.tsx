"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAddCompany } from "@/contexts/AddCompanyFormContext";
import type { AddCompanyForm } from "@/lib/add-company-types";
import { initialAddCompanyForm } from "@/lib/add-company-types";
import { DatePickerField } from "@/components/cerulean/DatePickerField";
import { FundSelector } from "./FundSelector";
import {
  AddressDisplay,
  AlertCheckboxes,
  FormField,
  FormTextarea,
  FrequencyGroup,
  IntegrationCard,
  MultiSelectChips,
  NavigationButtons,
  PriorityGroup,
  SelectDropdown,
  StepHeader,
  StepProgress,
  TaggedTextarea,
  TwoColumnRow,
  UploadZone,
} from "./ui";

const SECTORS = [
  "SaaS",
  "FinTech",
  "EdTech",
  "HealthTech",
  "Deep Tech",
  "AI/ML",
  "Consumer",
  "Marketplace",
  "LegalTech",
  "ClimateTech",
  "Other",
];
const MODELS = [
  "B2B",
  "B2C",
  "B2B2C",
  "Marketplace",
  "Usage-based",
  "Transactional",
];
const GEO = [
  "United States",
  "United Kingdom",
  "European Union",
  "APAC",
  "Global / Multi-region",
  "Other",
];
const STAGES = [
  "Pre-seed",
  "Seed",
  "Series A",
  "Series B",
  "Series C+",
  "Growth",
];
const PRORATA = [
  "Yes — full pro-rata",
  "Yes — proportional",
  "No",
  "To be negotiated",
];
const GOV = [
  "Board seat",
  "Board observer",
  "Information rights only",
  "None documented",
];
const METRICS = [
  "MRR",
  "ARR",
  "Revenue",
  "Customer count",
  "DAU / MAU",
  "GMV",
  "NRR / NDR",
  "Churn rate",
  "Gross margin",
  "Runway",
  "Headcount",
  "Pipeline",
  "NPS",
  "CAC",
  "LTV",
  "Burn rate",
];

function clampStep(n: number) {
  return Math.min(5, Math.max(1, n));
}

export function AddCompanyWizard({
  editCompanyId,
}: {
  editCompanyId?: string;
} = {}) {
  const router = useRouter();
  const sp = useSearchParams();
  const {
    form,
    setField,
    setForm,
    replaceForm,
    validateStep,
    clearStepErrors,
    stepErrors,
    reset,
  } = useAddCompany();
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(!editCompanyId);

  const basePath = editCompanyId
    ? `/companies/${editCompanyId}/edit`
    : "/companies/add";

  const step = clampStep(Number(sp.get("step") || 1) || 1);

  const setStep = useCallback(
    (n: number) => {
      clearStepErrors();
      router.replace(`${basePath}?step=${n}`);
    },
    [router, clearStepErrors, basePath]
  );

  useEffect(() => {
    if (!sp.get("step")) {
      router.replace(`${basePath}?step=1`);
    }
  }, [sp, router, basePath]);

  useEffect(() => {
    if (!editCompanyId) return;
    let cancel = false;
    void (async () => {
      const res = await fetch(`/api/companies/${editCompanyId}`);
      if (!res.ok) {
        if (!cancel) router.replace("/companies");
        return;
      }
      const data = (await res.json()) as { form?: AddCompanyForm };
      if (cancel || !data.form) return;
      replaceForm({ ...initialAddCompanyForm, ...data.form });
      setLoaded(true);
    })();
    return () => {
      cancel = true;
    };
  }, [editCompanyId, replaceForm, router]);

  const goNext = (fromStep: number) => {
    if (!validateStep(fromStep)) return;
    if (fromStep < 5) setStep(fromStep + 1);
  };

  const goBack = (fromStep: number) => {
    clearStepErrors();
    if (fromStep > 1) setStep(fromStep - 1);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(5)) return;
    setSubmitting(true);
    setApiError(null);
    try {
      if (editCompanyId) {
        const res = await fetch(`/api/companies/${editCompanyId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form as unknown as AddCompanyForm),
        });
        const data = (await res.json()) as { error?: string };
        if (!res.ok) {
          setApiError(data.error ?? "Request failed");
          return;
        }
        router.push(`/companies/${editCompanyId}/flags`);
        return;
      }
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form as unknown as AddCompanyForm),
      });
      const data = (await res.json()) as { companyId: string; error?: string };
      if (!res.ok) {
        setApiError(data.error ?? "Request failed");
        return;
      }
      reset();
      router.push(`/companies/${data.companyId}/flags`);
    } catch {
      setApiError("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  if (editCompanyId && !loaded) {
    return (
      <div className="px-8 py-12 text-center text-[16px] text-text-2">Loading form…</div>
    );
  }

  return (
    <div className="px-8 py-6">
      <nav className="mb-3 text-[13px] text-text-3" aria-label="Breadcrumb">
        <Link href="/companies" className="hover:underline">
          Portfolio
        </Link>
        <span className="px-1">›</span>
        <span className="text-text-2">
          {editCompanyId ? "Edit company" : "Add company"}
        </span>
      </nav>
      <h1 className="mb-1 text-[20px] font-semibold text-text-1">
        {editCompanyId ? "Edit company" : "Add a company"}
      </h1>
      <StepProgress currentStep={step} />

      {step === 1 && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            goNext(1);
          }}
        >
          <StepHeader
            step="1"
            title="Company identity"
            description="Basic information used across the audit log, external signal cross-reference, and forensic baseline."
          />
          <div className="space-y-3">
            <TwoColumnRow>
              <FormField
                label="Legal company name"
                placeholder="TAPD Inc."
                value={form.legalName}
                onChange={(v) => setField("legalName", v)}
                error={stepErrors.legalName}
              />
              <FormField
                label="Trading name / brand"
                placeholder="Frank"
                value={form.brandName}
                onChange={(v) => setField("brandName", v)}
              />
            </TwoColumnRow>
            <TwoColumnRow>
              <FormField
                label="Website"
                placeholder="https://company.com"
                value={form.website}
                onChange={(v) => setField("website", v)}
              />
              <FormField
                label="LinkedIn company URL"
                placeholder="linkedin.com/company/..."
                value={form.linkedinUrl}
                onChange={(v) => setField("linkedinUrl", v)}
              />
            </TwoColumnRow>
            <TwoColumnRow>
              <FormField
                label="GitHub organization URL"
                placeholder="github.com/company"
                value={form.githubUrl}
                onChange={(v) => setField("githubUrl", v)}
                hint="— feeds AI-washing detection"
              />
              <FormField
                label="Founded"
                placeholder="2022"
                value={form.founded}
                onChange={(v) => setField("founded", v)}
              />
            </TwoColumnRow>
            <TwoColumnRow>
              <FormField
                label="Incorporation state"
                placeholder="Delaware"
                value={form.incorporationState}
                onChange={(v) => setField("incorporationState", v)}
              />
              <FormField
                label="Entity type"
                placeholder="C-Corp / LLC / PBC"
                value={form.entityType}
                onChange={(v) => setField("entityType", v)}
              />
            </TwoColumnRow>
            <MultiSelectChips
              label="Primary sector"
              options={SECTORS}
              value={form.sector}
              onChange={(v) => setField("sector", v)}
            />
            <MultiSelectChips
              label="Business model"
              options={MODELS}
              value={form.businessModel}
              onChange={(v) => setField("businessModel", v)}
            />
            <TwoColumnRow>
              <SelectDropdown
                label="Primary geography"
                options={GEO.map((g) => ({ value: g, label: g }))}
                value={form.geography}
                onChange={(v) => setField("geography", v)}
                placeholder="Select"
              />
              <FormField
                label="Current headcount (approx.)"
                placeholder="e.g. 12"
                value={form.headcount}
                onChange={(v) => setField("headcount", v)}
                hint="— baseline for LinkedIn monitoring"
              />
            </TwoColumnRow>
          </div>
          <NavigationButtons
            onNext={() => goNext(1)}
            nextLabel="Next — Investment details →"
            showBack={false}
          />
        </form>
      )}

      {step === 2 && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            goNext(2);
          }}
        >
          <StepHeader
            step="2"
            title="Investment details"
            description="Used to calibrate flag thresholds, set monitoring priority, and configure the convergence engine."
          />
          <FundSelector />
          <hr className="my-4 border-border" />
          <div className="space-y-3">
            <TwoColumnRow>
              <DatePickerField
                label="Investment date"
                hint="— used for note dates and sequence"
                placeholder="Select investment date"
                value={form.investmentDate}
                onChange={(v) => setField("investmentDate", v)}
                error={stepErrors.investmentDate}
              />
              <SelectDropdown
                label="Stage at investment"
                options={STAGES.map((s) => ({ value: s, label: s }))}
                value={form.stage}
                onChange={(v) => setField("stage", v)}
                placeholder="Select"
              />
            </TwoColumnRow>
            <TwoColumnRow>
              <FormField
                label="Your check size"
                placeholder="$250,000"
                value={form.checkSize}
                onChange={(v) => setField("checkSize", v)}
                error={stepErrors.checkSize}
              />
              <FormField
                label="Total round size"
                placeholder="$3,500,000"
                value={form.roundSize}
                onChange={(v) => setField("roundSize", v)}
              />
            </TwoColumnRow>
            <TwoColumnRow>
              <FormField
                label="Round lead investor"
                placeholder="Sequoia Capital"
                value={form.leadInvestor}
                onChange={(v) => setField("leadInvestor", v)}
              />
              <FormField
                label="Round valuation (post-money)"
                placeholder="$12,000,000"
                value={form.valuation}
                onChange={(v) => setField("valuation", v)}
              />
            </TwoColumnRow>
            <TwoColumnRow>
              <FormField
                label="Your ownership %"
                placeholder="2.1%"
                value={form.ownership}
                onChange={(v) => setField("ownership", v)}
              />
              <SelectDropdown
                label="Pro-rata rights"
                options={PRORATA.map((s) => ({ value: s, label: s }))}
                value={form.proRata}
                onChange={(v) => setField("proRata", v)}
                placeholder="Select"
              />
            </TwoColumnRow>
            <MultiSelectChips
              label="Your governance rights"
              options={GOV}
              value={form.governanceRights}
              onChange={(v) => setField("governanceRights", v)}
            />
            <FormTextarea
              label="Named co-investors (one per line)"
              rows={3}
              placeholder="Andreessen Horowitz\nFirst Round Capital\nAngel — Sarah Park"
              value={form.coInvestors}
              onChange={(v) => setField("coInvestors", v)}
            />
            <FormTextarea
              label="Named customers or partners claimed at time of investment"
              rows={3}
              placeholder="NYC Department of Education\nGoogle\n(one per line — each will be automatically cross-referenced against external databases)"
              value={form.namedCustomers}
              onChange={(v) => setField("namedCustomers", v)}
            />
            <FormTextarea
              label="Named competitors"
              rows={3}
              placeholder="Competitor A\nCompetitor B\n(one per line — feeds competitor intelligence module)"
              value={form.namedCompetitors}
              onChange={(v) => setField("namedCompetitors", v)}
            />
            <StepHeader
              step=""
              title="Founding team"
              description="Feeds authorship shift baseline and founder credential verification."
              color="text-3"
            />
            <TwoColumnRow>
              <FormField
                label="Founder 1 name"
                placeholder="Jane Smith"
                value={form.founder1Name}
                onChange={(v) => setField("founder1Name", v)}
              />
              <FormField
                label="Founder 1 LinkedIn"
                placeholder="linkedin.com/in/..."
                value={form.founder1LinkedIn}
                onChange={(v) => setField("founder1LinkedIn", v)}
              />
            </TwoColumnRow>
            <TwoColumnRow>
              <FormField
                label="Founder 2 name (if any)"
                placeholder="John Doe"
                value={form.founder2Name}
                onChange={(v) => setField("founder2Name", v)}
              />
              <FormField
                label="Founder 2 LinkedIn"
                placeholder="linkedin.com/in/..."
                value={form.founder2LinkedIn}
                onChange={(v) => setField("founder2LinkedIn", v)}
              />
            </TwoColumnRow>
            <FormTextarea
              label="Background claims to verify"
              rows={2}
              placeholder="e.g. 'Previously sold company to Google', 'Former Goldman Sachs VP', 'PhD MIT' — each claim will be cross-referenced automatically"
              value={form.backgroundClaims}
              onChange={(v) => setField("backgroundClaims", v)}
            />
          </div>
          <NavigationButtons
            onBack={() => goBack(2)}
            onNext={() => goNext(2)}
            nextLabel="Next — Ingestion setup →"
          />
        </form>
      )}

      {step === 3 && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            goNext(3);
          }}
        >
          <StepHeader
            step="3"
            title="Ingestion configuration"
            description="How Cerulean receives investor updates. Forward existing updates to seed the baseline immediately."
          />
          <div className="mb-3 space-y-3">
            <AddressDisplay
              address={form.forwardingAddress || "company@updates.cerulean.ai"}
              onCopy={() => {
                void navigator.clipboard.writeText(
                  form.forwardingAddress || "company@updates.cerulean.ai"
                );
              }}
            />
            <FormTextarea
              label="Founder email address(es) sending updates"
              rows={2}
              placeholder="founder@company.com, ceo@company.com — updates from these addresses are auto-tagged to this company"
              value={form.founderEmails}
              onChange={(v) => setField("founderEmails", v)}
            />
            {stepErrors.ingestion ? (
              <p className="text-[13px] text-red">{stepErrors.ingestion}</p>
            ) : null}
            <FrequencyGroup
              value={form.updateFrequency}
              onChange={(v) => setField("updateFrequency", v)}
            />
            <UploadZone
              label="Historical update archive"
              subtext="PDF, .txt, .eml, .docx — we build the baseline from these immediately"
              onFiles={(files) => setForm({ historicalFileMeta: files })}
            />
            {form.historicalFileMeta.length > 0 ? (
              <p className="text-[12px] text-text-2">
                {form.historicalFileMeta.length} file(s) selected
              </p>
            ) : null}
            <StepHeader
              step=""
              title="Optional integrations"
              description="Connect data sources for cross-reference signals. Founder authorization required for Plaid."
              color="text-3"
            />
            <IntegrationCard
              name="Visible.vc"
              description="Pull structured metrics alongside narrative — enriches baseline with structured data"
              buttonLabel="Connect Visible →"
              buttonVariant="teal"
              connected={form.visibleConnected}
              onAction={() => setForm({ visibleConnected: !form.visibleConnected })}
            />
            <IntegrationCard
              name="Carta"
              description="Cap table events — equity issuances, option grants, conversions — cross-referenced against updates"
              buttonLabel="Connect Carta →"
              buttonVariant="teal"
              connected={form.cartaConnected}
              onAction={() => setForm({ cartaConnected: !form.cartaConnected })}
            />
            <IntegrationCard
              name="Plaid (Open Banking)"
              description="Bank account inflows — ground-truth financial verification. Requires founder authorization. Optional."
              buttonLabel="Request founder auth →"
              buttonVariant="amber"
              connected={form.plaidRequested}
              onAction={() => setForm({ plaidRequested: !form.plaidRequested })}
            />
          </div>
          <NavigationButtons
            onBack={() => goBack(3)}
            onNext={() => goNext(3)}
            nextLabel="Next — Monitoring setup →"
          />
        </form>
      )}

      {step === 4 && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            goNext(4);
          }}
        >
          <StepHeader
            step="4"
            title="Monitoring configuration"
            description="Tell the forensic engine what to watch for. These settings calibrate signal thresholds for this company specifically."
          />
          <div className="space-y-3">
            <MultiSelectChips
              label="Primary metrics reported (select all that apply)"
              options={METRICS}
              value={form.trackedMetrics}
              onChange={(v) => setField("trackedMetrics", v)}
            />
            <FormTextarea
              label="Key milestone commitments at close (one per line — each becomes a tracked commitment)"
              rows={4}
              placeholder="FDA approval by Q3 2025\nHire VP Sales by Q2 2025\nClose Series A by December 2025\n(Cerulean will flag if these disappear from subsequent updates without acknowledgment)"
              value={form.milestoneCommitments}
              onChange={(v) => setField("milestoneCommitments", v)}
            />
            <PriorityGroup
              value={form.monitoringPriority}
              onChange={(v) => setField("monitoringPriority", v)}
            />
            <FormTextarea
              label="Custom keywords to monitor (optional — one per line)"
              rows={3}
              placeholder="FDA\nGoogle partnership\nIPO\n(Cerulean will surface flags specifically when these topics appear or disappear)"
              value={form.customKeywords}
              onChange={(v) => setField("customKeywords", v)}
            />
            <AlertCheckboxes
              email={form.alertEmail}
              slack={form.alertSlack}
              mobile={form.alertMobile}
              onChange={(p) => {
                if (p.email !== undefined) setField("alertEmail", p.email);
                if (p.slack !== undefined) setField("alertSlack", p.slack);
                if (p.mobile !== undefined) setField("alertMobile", p.mobile);
              }}
            />
          </div>
          <NavigationButtons
            onBack={() => goBack(4)}
            onNext={() => goNext(4)}
            nextLabel="Next — Initial notes →"
          />
        </form>
      )}

      {step === 5 && (
        <form onSubmit={submit}>
          <StepHeader
            step="5"
            title="Initial investor notes"
            description="Your knowledge at the time of investment. These notes are private, feed the forensic engine immediately, and create the intelligence baseline before the first update arrives."
            color="purple"
          />
          <p className="mb-3 text-[13px] text-text-2">
            These notes are never shared with the founder. They are included in your private My
            Notes layer and immediately available to the convergence engine.
          </p>
          {apiError ? <p className="mb-2 text-[13px] text-red">{apiError}</p> : null}
          <div className="space-y-3">
            <TaggedTextarea
              label="Investment thesis"
              tag="Market"
              tagColor="teal"
              rows={4}
              placeholder="Why you invested. What market insight drove the decision. What outcome you are underwriting.

(Tagged as Market note — calibrates signal weighting against your stated thesis)"
              value={form.thesisNote}
              onChange={(v) => setField("thesisNote", v)}
            />
            <TaggedTextarea
              label="Key risks identified at diligence"
              tag="Concern"
              tagColor="red"
              rows={4}
              placeholder="Concerns from reference checks, financial diligence, or market analysis that you will monitor over time.

(Tagged as Concern note — lowers convergence threshold for related signals)"
              value={form.risksNote}
              onChange={(v) => setField("risksNote", v)}
            />
            <TaggedTextarea
              label="Commitments made by founders at close (separate from formal milestones)"
              tag="Commitment"
              tagColor="gold"
              rows={4}
              placeholder="Off-record verbal commitments, specific promises made during negotiation, or commitments from side conversations.

(Tagged as Commitment note — Cerulean will flag if absent from subsequent updates)"
              value={form.commitmentsNote}
              onChange={(v) => setField("commitmentsNote", v)}
            />
            <TaggedTextarea
              label="Context from reference checks and background"
              tag="Context"
              tagColor="text-3"
              rows={4}
              placeholder="Information that explains the founder's history, team dynamics, customer relationships, or market position that an update alone would not surface.

(Tagged as Context note — reference material for interpreting flags)"
              value={form.contextNote}
              onChange={(v) => setField("contextNote", v)}
            />
            <div className="rounded-lg border-l-[3px] border-purple bg-purple/[0.05] px-3 py-2 text-[12px] text-text-2">
              All notes are encrypted, stored under your account only, never shared with the
              portfolio company, and included in session purge for Iuris matters.
            </div>
          </div>
          <NavigationButtons
            onBack={() => goBack(5)}
            nextLabel={editCompanyId ? "Save changes" : "Add company & start monitoring"}
            isSubmit
            isLoading={submitting}
            nextWidth={164}
            disabled={submitting}
          />
        </form>
      )}
    </div>
  );
}
