export type FundRow = {
  id: string;
  name: string;
  vintage: string;
  size: string;
  vehicle: string;
  status: string;
  companiesCount: number;
};

export const FUNDS: FundRow[] = [
  {
    id: "fund-1",
    name: "Fund I",
    vintage: "2019",
    size: "$45M",
    vehicle: "LP Fund",
    status: "harvesting",
    companiesCount: 28,
  },
  {
    id: "fund-2",
    name: "Fund II",
    vintage: "2022",
    size: "$80M",
    vehicle: "LP Fund",
    status: "deploying",
    companiesCount: 19,
  },
  {
    id: "fund-3",
    name: "Fund III",
    vintage: "2024",
    size: "$120M",
    vehicle: "LP Fund",
    status: "active deployment",
    companiesCount: 7,
  },
];

export function getFundById(id: string): FundRow | undefined {
  return FUNDS.find((f) => f.id === id);
}
