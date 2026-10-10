export type RiskLevel = "Low" | "Medium" | "High" | "Very High";

export type KycStatus = "Not started" | "Pending" | "Under review" | "Verified" | "Rejected";

export type InvestmentStatus = "Pending" | "Active" | "Completed" | "Withdrawn" | "Suspended";

export type TxStatus = "Pending" | "Processing" | "Completed" | "Rejected" | "Cancelled";

export type TxType = "Deposit" | "Withdrawal" | "Allocation" | "Yield" | "Fee";

export type AdminRole =
  | "Super Admin"
  | "Compliance Admin"
  | "Finance Admin"
  | "Support Admin"
  | "Read Only Admin";

export interface Strategy {
  id: string;
  name: string;
  category: "DeFi Lending" | "Staking" | "Liquidity" | "Stablecoin Yield";
  summary: string;
  description: string;
  risk: RiskLevel;
  targetMonthly: number; // percent, illustrative target
  minInvestment: number;
  lockupMonths: number;
  liquidity: string;
  managementFee: number;
  performanceFee: number;
  capacity: number;
  allocated: number;
  active: boolean;
}

export interface PortfolioAsset {
  id: string;
  name: string;
  symbol: string;
  weight: number; // percent
  price: number;
  risk: RiskLevel;
  note: string;
}

export interface Investment {
  id: string;
  userId: string;
  strategyId: string;
  amount: number;
  currentValue: number;
  status: InvestmentStatus;
  startedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  reference: string;
  type: TxType;
  method?: string | undefined;
  amount: number;
  fee: number;
  status: TxStatus;
  createdAt: string;
  note?: string | undefined;
  destination?: string | undefined;
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  category: string;
  priority: "Low" | "Normal" | "High";
  status: "Open" | "Awaiting client" | "Resolved";
  createdAt: string;
  messages: { from: "client" | "desk"; body: string; at: string }[];
}

export interface KycDocument {
  id: string;
  userId: string;
  type: string;
  fileName: string;
  status: KycStatus;
  uploadedAt: string;
}

export interface Session {
  id: string;
  device: string;
  location: string;
  ip: string;
  at: string;
  current: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  country: string;
  accountStatus: "Active" | "Restricted" | "Suspended";
  kycStatus: KycStatus;
  twoFactor: boolean;
  cashBalance: number;
  joinedAt: string;
  tier: "Core" | "Private Client" | "Institutional";
  sessions: Session[];
}

export interface AuditEntry {
  id: string;
  at: string;
  actor: string;
  role: AdminRole;
  action: string;
  target: string;
  detail: string;
}

export interface PlatformStats {
  aum: number;
  investors: number;
  strategiesLive: number;
  avgMonthlyTarget: number;
  monthlyPayoutsUsd: number;
  uptimePct: number;
  lastUpdated: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  at: string;
}
