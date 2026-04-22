import type { Cadence } from "@/data/company-types";

export type AddCompanyForm = {
  legalName: string;
  brandName: string;
  website: string;
  linkedinUrl: string;
  githubUrl: string;
  founded: string;
  incorporationState: string;
  entityType: string;
  sector: string[];
  businessModel: string[];
  geography: string;
  headcount: string;

  fundId: string;
  fundName: string;
  vehicleType: string;
  vintageYear: string;
  isNewFund: boolean;
  newFundName: string;
  investmentDate: string;
  stage: string;
  checkSize: string;
  roundSize: string;
  leadInvestor: string;
  valuation: string;
  ownership: string;
  proRata: string;
  governanceRights: string[];
  coInvestors: string;
  namedCustomers: string;
  namedCompetitors: string;
  founder1Name: string;
  founder1LinkedIn: string;
  founder2Name: string;
  founder2LinkedIn: string;
  backgroundClaims: string;

  founderEmails: string;
  updateFrequency: "weekly" | "monthly" | "quarterly" | "irregular";
  forwardingAddress: string;
  historicalFileMeta: { name: string; size: number }[];
  visibleConnected: boolean;
  cartaConnected: boolean;
  plaidRequested: boolean;

  trackedMetrics: string[];
  milestoneCommitments: string;
  monitoringPriority: "high" | "standard" | "low";
  customKeywords: string;
  alertEmail: boolean;
  alertSlack: boolean;
  alertMobile: boolean;

  thesisNote: string;
  risksNote: string;
  commitmentsNote: string;
  contextNote: string;
};

export const initialAddCompanyForm: AddCompanyForm = {
  legalName: "",
  brandName: "",
  website: "",
  linkedinUrl: "",
  githubUrl: "",
  founded: "",
  incorporationState: "",
  entityType: "",
  sector: [],
  businessModel: [],
  geography: "",
  headcount: "",

  fundId: "",
  fundName: "",
  vehicleType: "LP Fund",
  vintageYear: "",
  isNewFund: false,
  newFundName: "",
  investmentDate: "",
  stage: "",
  checkSize: "",
  roundSize: "",
  leadInvestor: "",
  valuation: "",
  ownership: "",
  proRata: "",
  governanceRights: ["Information rights only"],
  coInvestors: "",
  namedCustomers: "",
  namedCompetitors: "",
  founder1Name: "",
  founder1LinkedIn: "",
  founder2Name: "",
  founder2LinkedIn: "",
  backgroundClaims: "",

  founderEmails: "",
  updateFrequency: "monthly",
  forwardingAddress: "",
  historicalFileMeta: [],
  visibleConnected: false,
  cartaConnected: false,
  plaidRequested: false,

  trackedMetrics: ["MRR", "ARR", "Customer count", "NRR / NDR", "Runway"],
  milestoneCommitments: "",
  monitoringPriority: "standard",
  customKeywords: "",
  alertEmail: true,
  alertSlack: true,
  alertMobile: false,

  thesisNote: "",
  risksNote: "",
  commitmentsNote: "",
  contextNote: "",
};

export function mapUpdateFrequencyToCadence(
  f: AddCompanyForm["updateFrequency"]
): Cadence {
  switch (f) {
    case "weekly":
      return "Weekly";
    case "monthly":
      return "Monthly";
    case "quarterly":
      return "Irregular";
    case "irregular":
      return "Irregular";
    default:
      return "Monthly";
  }
}
