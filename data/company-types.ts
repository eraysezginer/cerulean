export type Cadence = "Monthly" | "Weekly" | "Irregular" | "Silent";

export type CompanyRow = {
  id: string;
  name: string;
  health: number;
  flags: number;
  negativeFlags: number;
  positiveFlags: number;
  lastUpdate: string;
  cadence: Cadence;
  series?: string;
};
