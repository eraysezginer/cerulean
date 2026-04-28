import { notFound } from "next/navigation";
import { getCompanyById } from "@/data/companies";

function SectionHeading({
  children,
  withDivider,
}: {
  children: React.ReactNode;
  withDivider?: boolean;
}) {
  return (
    <div
      className={
        "mb-3 flex w-full max-w-4xl items-center gap-3 text-section-label uppercase text-text-3" +
        (withDivider ? " border-b border-border pb-2" : "")
      }
    >
      {children}
    </div>
  );
}

export default async function BehavioralPage({
  params,
}: {
  params: { id: string };
}) {
  const company = await getCompanyById(params.id);
  if (!company) notFound();

  return (
    <div className="p-8">
      <p className="mb-1 text-section-label uppercase text-text-3">Portfolio</p>
      <h1 className="mb-1 text-page-title text-text-1">
        {company.name} — Behavioral
      </h1>
      <p className="mb-8 max-w-2xl text-body text-text-2">
        Cadence, send-time, and disclosure-depth signals derived from update
        metadata and body text. Signals are descriptive only.
      </p>

      <SectionHeading withDivider>Cadence timeline</SectionHeading>
      <EmptyState />

      <SectionHeading withDivider>Send time pattern</SectionHeading>
      <EmptyState />

      <SectionHeading withDivider>
        Response latency — days to reply
      </SectionHeading>
      <EmptyState />

      <SectionHeading withDivider>Metric count per update</SectionHeading>
      <EmptyState />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mb-10 max-w-4xl rounded-lg border border-dashed border-border bg-bg-2 p-5 text-body text-text-2">
      No behavioral data has been derived for this company yet.
    </div>
  );
}
