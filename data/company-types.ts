export type Cadence = "Monthly" | "Weekly" | "Irregular" | "Silent";
export type PortfolioFund = "Fund 1" | "Fund 2" | "Fund 3" | "Fund 4" | "Fund 5";

export type CompanyRow = {
  id: string;
  name: string;
  fund?: PortfolioFund;
  health: number;
  flags: number;
  negativeFlags: number;
  positiveFlags: number;
  lastUpdate: string;
  cadence: Cadence;
  series?: string;
};
