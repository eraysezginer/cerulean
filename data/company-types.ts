export type Cadence = "Monthly" | "Weekly" | "Irregular" | "Silent";

export type CompanyRow = {
  id: string;
  name: string;
  health: number;
  flags: number;
  lastUpdate: string;
  cadence: Cadence;
  series?: string;
};
