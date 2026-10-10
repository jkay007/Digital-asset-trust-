import type {
  Announcement,
  AuditEntry,
  Investment,
  KycDocument,
  PlatformStats,
  PortfolioAsset,
  Strategy,
  SupportTicket,
  Transaction,
  User,
} from "./types";

const iso = (daysAgo: number) =>
  new Date(Date.now() - daysAgo * 86_400_000).toISOString();

export const seedStrategies: Strategy[] = [
  {
    id: "str-lending",
    name: "Collateralised DeFi Lending",
    category: "DeFi Lending",
    summary:
      "Over-collateralised lending across blue-chip money markets with continuous solvency monitoring.",
    description:
      "Capital is supplied to audited lending venues with conservative loan-to-value thresholds. Positions are monitored for utilisation, oracle integrity and liquidation depth. Target returns are illustrative and vary with on-chain borrowing demand.",
    risk: "Medium",
    targetMonthly: 1.6,
    minInvestment: 1000,
    lockupMonths: 1,
    liquidity: "Monthly, 7-day notice",
    managementFee: 1,
    performanceFee: 10,
    capacity: 45_000_000,
    allocated: 28_400_000,
    active: true,
  },
  {
    id: "str-staking",
    name: "Institutional Staking",
    category: "Staking",
    summary:
      "Validator and liquid-staking exposure across established proof-of-stake networks.",
    description:
      "Diversified validator sets with slashing insurance where available. Rewards accrue in protocol tokens and are periodically converted according to mandate policy. Network penalties and token price volatility are material risks.",
    risk: "Medium",
    targetMonthly: 1.1,
    minInvestment: 1000,
    lockupMonths: 3,
    liquidity: "Quarterly, unbonding applies",
    managementFee: 0.9,
    performanceFee: 8,
    capacity: 60_000_000,
    allocated: 33_900_000,
    active: true,
  },
  {
    id: "str-liquidity",
    name: "Managed Liquidity Provision",
    category: "Liquidity",
    summary:
      "Concentrated liquidity across deep pairs with active range management and hedging.",
    description:
      "Positions are rebalanced against volatility bands, with impermanent-loss hedging on correlated pairs. This is the highest-variance sleeve in the platform and is capped at mandate level.",
    risk: "High",
    targetMonthly: 2.4,
    minInvestment: 5000,
    lockupMonths: 3,
    liquidity: "Quarterly, 14-day notice",
    managementFee: 1.5,
    performanceFee: 15,
    capacity: 25_000_000,
    allocated: 14_100_000,
    active: true,
  },
  {
    id: "str-stable",
    name: "Stablecoin Yield",
    category: "Stablecoin Yield",
    summary:
      "Short-duration stablecoin deployment across vetted venues and tokenised cash equivalents.",
    description:
      "The defensive sleeve of the platform. Emphasis on issuer quality, redemption depth and counterparty diversification. Depeg and custody failure remain the principal risks.",
    risk: "Low",
    targetMonthly: 0.7,
    minInvestment: 1000,
    lockupMonths: 0,
    liquidity: "Monthly, no notice",
    managementFee: 0.6,
    performanceFee: 5,
    capacity: 80_000_000,
    allocated: 41_200_000,
    active: true,
  },
];

export const seedAssets: PortfolioAsset[] = [
  { id: "a-btc", name: "Bitcoin", symbol: "BTC", weight: 18, price: 68420, risk: "High", note: "Core reserve asset exposure" },
  { id: "a-eth", name: "Ethereum", symbol: "ETH", weight: 16, price: 3480, risk: "High", note: "Settlement layer and staking base" },
  { id: "a-stk", name: "Staking Positions", symbol: "STK", weight: 17, price: 1, risk: "Medium", note: "Validator and liquid staking" },
  { id: "a-lend", name: "DeFi Lending", symbol: "LEND", weight: 19, price: 1, risk: "Medium", note: "Over-collateralised money markets" },
  { id: "a-stable", name: "Stablecoins", symbol: "USD*", weight: 15, price: 1, risk: "Low", note: "Defensive yield and dry powder" },
  { id: "a-lp", name: "Liquidity Positions", symbol: "LP", weight: 10, price: 1, risk: "Very High", note: "Concentrated market making" },
  { id: "a-cash", name: "Cash & Equivalents", symbol: "CASH", weight: 5, price: 1, risk: "Low", note: "Operating and redemption buffer" },
];

export const seedUsers: User[] = [
  {
    id: "usr-demo",
    name: "Alexandra Reyes",
    email: "investor@meridian.capital",
    password: "investor123",
    country: "Portugal",
    accountStatus: "Active",
    kycStatus: "Verified",
    twoFactor: true,
    cashBalance: 12_450,
    joinedAt: iso(420),
    tier: "Private Client",
    sessions: [
      { id: "s1", device: "MacBook Pro · Safari", location: "Lisbon, PT", ip: "84.12.44.9", at: iso(0), current: true },
      { id: "s2", device: "iPhone 15 · App", location: "Lisbon, PT", ip: "84.12.44.9", at: iso(2), current: false },
      { id: "s3", device: "Windows · Chrome", location: "Madrid, ES", ip: "88.20.10.4", at: iso(11), current: false },
    ],
  },
  {
    id: "usr-002",
    name: "Daniel Okafor",
    email: "d.okafor@northbridge.io",
    password: "investor123",
    country: "United Kingdom",
    accountStatus: "Active",
    kycStatus: "Under review",
    twoFactor: false,
    cashBalance: 3_200,
    joinedAt: iso(96),
    tier: "Core",
    sessions: [{ id: "s1", device: "Windows · Edge", location: "London, UK", ip: "51.10.3.77", at: iso(1), current: true }],
  },
  {
    id: "usr-003",
    name: "Mei Tanaka",
    email: "mei.tanaka@ksfund.jp",
    password: "investor123",
    country: "Japan",
    accountStatus: "Active",
    kycStatus: "Pending",
    twoFactor: true,
    cashBalance: 88_000,
    joinedAt: iso(38),
    tier: "Institutional",
    sessions: [{ id: "s1", device: "iPad · Safari", location: "Tokyo, JP", ip: "126.4.9.22", at: iso(3), current: true }],
  },
  {
    id: "usr-004",
    name: "Lukas Brenner",
    email: "l.brenner@altview.de",
    password: "investor123",
    country: "Germany",
    accountStatus: "Restricted",
    kycStatus: "Rejected",
    twoFactor: false,
    cashBalance: 0,
    joinedAt: iso(212),
    tier: "Core",
    sessions: [],
  },
];

export const seedInvestments: Investment[] = [
  { id: "inv-1", userId: "usr-demo", strategyId: "str-lending", amount: 40_000, currentValue: 44_820, status: "Active", startedAt: iso(300) },
  { id: "inv-2", userId: "usr-demo", strategyId: "str-stable", amount: 25_000, currentValue: 26_410, status: "Active", startedAt: iso(180) },
  { id: "inv-3", userId: "usr-demo", strategyId: "str-liquidity", amount: 15_000, currentValue: 17_260, status: "Active", startedAt: iso(120) },
  { id: "inv-4", userId: "usr-demo", strategyId: "str-staking", amount: 10_000, currentValue: 10_180, status: "Pending", startedAt: iso(4) },
  { id: "inv-5", userId: "usr-002", strategyId: "str-stable", amount: 5_000, currentValue: 5_090, status: "Active", startedAt: iso(60) },
  { id: "inv-6", userId: "usr-003", strategyId: "str-staking", amount: 250_000, currentValue: 263_400, status: "Active", startedAt: iso(30) },
];

export const seedTransactions: Transaction[] = [
  { id: "tx-1", userId: "usr-demo", reference: "DEP-4F81A2", type: "Deposit", method: "Bank transfer (SEPA)", amount: 40_000, fee: 0, status: "Completed", createdAt: iso(300) },
  { id: "tx-2", userId: "usr-demo", reference: "ALC-99C120", type: "Allocation", amount: 40_000, fee: 0, status: "Completed", createdAt: iso(299) },
  { id: "tx-3", userId: "usr-demo", reference: "YLD-2200AB", type: "Yield", amount: 1_284.4, fee: 0, status: "Completed", createdAt: iso(31) },
  { id: "tx-4", userId: "usr-demo", reference: "WDR-71B0C4", type: "Withdrawal", amount: 5_000, fee: 25, status: "Processing", createdAt: iso(3), destination: "IBAN ****4471" },
  { id: "tx-5", userId: "usr-demo", reference: "FEE-3320DD", type: "Fee", amount: 96.2, fee: 0, status: "Completed", createdAt: iso(31), note: "Management fee, monthly accrual" },
  { id: "tx-6", userId: "usr-002", reference: "DEP-91AB03", type: "Deposit", method: "Stablecoin (USDC)", amount: 5_000, fee: 12.5, status: "Pending", createdAt: iso(1) },
  { id: "tx-7", userId: "usr-003", reference: "DEP-55EE71", type: "Deposit", method: "Wire transfer (SWIFT)", amount: 250_000, fee: 0, status: "Completed", createdAt: iso(30) },
  { id: "tx-8", userId: "usr-003", reference: "WDR-88FA20", type: "Withdrawal", amount: 40_000, fee: 120, status: "Pending", createdAt: iso(2), destination: "IBAN ****9930" },
];

export const seedTickets: SupportTicket[] = [
  {
    id: "tkt-1",
    userId: "usr-demo",
    subject: "Statement for Q2 not downloading",
    category: "Statements",
    priority: "Normal",
    status: "Awaiting client",
    createdAt: iso(6),
    messages: [
      { from: "client", body: "The Q2 statement download returns an empty file.", at: iso(6) },
      { from: "desk", body: "Thanks — we regenerated the document. Could you confirm it opens now?", at: iso(5) },
    ],
  },
  {
    id: "tkt-2",
    userId: "usr-002",
    subject: "KYC document rejected",
    category: "Compliance",
    priority: "High",
    status: "Open",
    createdAt: iso(2),
    messages: [{ from: "client", body: "My proof of address was rejected. What format do you need?", at: iso(2) }],
  },
];

export const seedDocuments: KycDocument[] = [
  { id: "doc-1", userId: "usr-demo", type: "Passport", fileName: "passport.pdf", status: "Verified", uploadedAt: iso(410) },
  { id: "doc-2", userId: "usr-demo", type: "Proof of address", fileName: "utility-bill.pdf", status: "Verified", uploadedAt: iso(410) },
  { id: "doc-3", userId: "usr-002", type: "Passport", fileName: "id-scan.jpg", status: "Under review", uploadedAt: iso(3) },
  { id: "doc-4", userId: "usr-003", type: "Corporate registry extract", fileName: "registry.pdf", status: "Pending", uploadedAt: iso(5) },
];

export const seedAudit: AuditEntry[] = [
  { id: "aud-1", at: iso(1), actor: "j.hall", role: "Compliance Admin", action: "KYC status changed", target: "usr-002", detail: "Pending → Under review" },
  { id: "aud-2", at: iso(2), actor: "s.mora", role: "Finance Admin", action: "Withdrawal approved", target: "WDR-71B0C4", detail: "USD 5,000 released to IBAN ****4471" },
  { id: "aud-3", at: iso(4), actor: "root", role: "Super Admin", action: "Strategy updated", target: "str-liquidity", detail: "Target monthly 2.2% → 2.4% (illustrative)" },
  { id: "aud-4", at: iso(9), actor: "s.mora", role: "Finance Admin", action: "Portfolio rebalanced", target: "portfolio", detail: "Stablecoins 17% → 15%, DeFi Lending 17% → 19%" },
];

export const seedStats: PlatformStats = {
  aum: 117_600_000,
  investors: 4_182,
  strategiesLive: 4,
  avgMonthlyTarget: 1.45,
  monthlyPayoutsUsd: 1_640_000,
  uptimePct: 99.98,
  lastUpdated: iso(1),
};

export const seedAnnouncements: Announcement[] = [
  { id: "ann-1", title: "Q2 transparency report published", body: "The quarterly strategy and exposure report is now available in Statements.", at: iso(7) },
  { id: "ann-2", title: "Liquidity sleeve capacity review", body: "Managed Liquidity Provision is approaching soft capacity; new allocations may be queued.", at: iso(18) },
];
