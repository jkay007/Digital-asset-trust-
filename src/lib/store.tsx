/**
 * Mock platform state store.
 *
 * Everything the UI needs is read and written through this provider, so the
 * whole data layer can later be swapped for Lovable Cloud tables without
 * touching component code: each slice below maps 1:1 to a future table.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { makeRef } from "./format";
import {
  seedAnnouncements,
  seedAssets,
  seedAudit,
  seedDocuments,
  seedInvestments,
  seedStats,
  seedStrategies,
  seedTickets,
  seedTransactions,
  seedUsers,
} from "./seed";
import type {
  AdminRole,
  Announcement,
  AuditEntry,
  Investment,
  KycDocument,
  KycStatus,
  PlatformStats,
  PortfolioAsset,
  Strategy,
  SupportTicket,
  Transaction,
  TxStatus,
  User,
} from "./types";

const STORAGE_KEY = "meridian.state.v1";

interface StateShape {
  users: User[];
  strategies: Strategy[];
  assets: PortfolioAsset[];
  investments: Investment[];
  transactions: Transaction[];
  tickets: SupportTicket[];
  documents: KycDocument[];
  audit: AuditEntry[];
  announcements: Announcement[];
  stats: PlatformStats;
  currentUserId: string | null;
  adminRole: AdminRole;
}

const initialState: StateShape = {
  users: seedUsers,
  strategies: seedStrategies,
  assets: seedAssets,
  investments: seedInvestments,
  transactions: seedTransactions,
  tickets: seedTickets,
  documents: seedDocuments,
  audit: seedAudit,
  announcements: seedAnnouncements,
  stats: seedStats,
  currentUserId: null,
  adminRole: "Super Admin",
};

interface StoreApi extends StateShape {
  currentUser: User | null;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  register: (input: { name: string; email: string; password: string; country: string }) => { ok: boolean; error?: string };
  logout: () => void;
  setAdminRole: (role: AdminRole) => void;
  createDeposit: (input: { amount: number; method: string; fee: number; strategyId?: string }) => Transaction;
  createWithdrawal: (input: { amount: number; destination: string; fee: number }) => Transaction;
  setTransactionStatus: (id: string, status: TxStatus, note?: string) => void;
  invest: (strategyId: string, amount: number) => { ok: boolean; error?: string };
  setInvestmentStatus: (id: string, status: Investment["status"]) => void;
  uploadDocument: (type: string, fileName: string) => void;
  setDocumentStatus: (id: string, status: KycStatus) => void;
  setUserKyc: (userId: string, status: KycStatus) => void;
  setUserStatus: (userId: string, status: User["accountStatus"]) => void;
  toggleTwoFactor: () => void;
  revokeSession: (id: string) => void;
  createTicket: (input: { subject: string; category: string; priority: SupportTicket["priority"]; body: string }) => void;
  replyTicket: (id: string, body: string, from: "client" | "desk") => void;
  setTicketStatus: (id: string, status: SupportTicket["status"]) => void;
  upsertStrategy: (strategy: Strategy) => void;
  updateAssetWeights: (assets: PortfolioAsset[]) => void;
  updateStats: (stats: Partial<PlatformStats>) => void;
  addAnnouncement: (title: string, body: string) => void;
  log: (action: string, target: string, detail: string) => void;
  reset: () => void;
}

const StoreContext = createContext<StoreApi | null>(null);

const nowIso = () => new Date().toISOString();

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StateShape>(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...initialState, ...(JSON.parse(raw) as StateShape) });
    } catch {
      /* ignore corrupt state */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable */
    }
  }, [state, hydrated]);

  const currentUser = useMemo(
    () => state.users.find((u) => u.id === state.currentUserId) ?? null,
    [state.users, state.currentUserId],
  );

  const log = useCallback((action: string, target: string, detail: string) => {
    setState((s) => ({
      ...s,
      audit: [
        { id: makeRef("aud"), at: nowIso(), actor: "console.operator", role: s.adminRole, action, target, detail },
        ...s.audit,
      ],
    }));
  }, []);

  const patchUser = useCallback((userId: string, patch: Partial<User>) => {
    setState((s) => ({
      ...s,
      users: s.users.map((u) => (u.id === userId ? { ...u, ...patch } : u)),
    }));
  }, []);

  const api: StoreApi = useMemo(
    () => ({
      ...state,
      currentUser,
      log,
      login: (email, password) => {
        const user = state.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
        if (!user) return { ok: false, error: "No account found with that email." };
        if (user.password !== password) return { ok: false, error: "Incorrect password." };
        if (user.accountStatus === "Suspended") return { ok: false, error: "Account suspended. Contact compliance." };
        setState((s) => ({ ...s, currentUserId: user.id }));
        return { ok: true };
      },
      register: ({ name, email, password, country }) => {
        if (state.users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase()))
          return { ok: false, error: "An account already exists with that email." };
        const user: User = {
          id: makeRef("usr").toLowerCase(),
          name,
          email: email.trim(),
          password,
          country,
          accountStatus: "Active",
          kycStatus: "Not started",
          twoFactor: false,
          cashBalance: 0,
          joinedAt: nowIso(),
          tier: "Core",
          sessions: [
            { id: "s1", device: "This device", location: "Unknown", ip: "—", at: nowIso(), current: true },
          ],
        };
        setState((s) => ({
          ...s,
          users: [...s.users, user],
          currentUserId: user.id,
          stats: { ...s.stats, investors: s.stats.investors + 1 },
        }));
        return { ok: true };
      },
      logout: () => setState((s) => ({ ...s, currentUserId: null })),
      setAdminRole: (adminRole) => setState((s) => ({ ...s, adminRole })),

      createDeposit: ({ amount, method, fee }) => {
        const tx: Transaction = {
          id: makeRef("tx").toLowerCase(),
          userId: state.currentUserId ?? "usr-demo",
          reference: makeRef("DEP"),
          type: "Deposit",
          method,
          amount,
          fee,
          status: "Pending",
          createdAt: nowIso(),
        };
        setState((s) => ({ ...s, transactions: [tx, ...s.transactions] }));
        return tx;
      },
      createWithdrawal: ({ amount, destination, fee }) => {
        const tx: Transaction = {
          id: makeRef("tx").toLowerCase(),
          userId: state.currentUserId ?? "usr-demo",
          reference: makeRef("WDR"),
          type: "Withdrawal",
          amount,
          fee,
          destination,
          status: "Pending",
          createdAt: nowIso(),
        };
        setState((s) => ({ ...s, transactions: [tx, ...s.transactions] }));
        return tx;
      },
      setTransactionStatus: (id, status, note) => {
        setState((s) => {
          const tx = s.transactions.find((t) => t.id === id);
          let users = s.users;
          if (tx && status === "Completed" && tx.type === "Deposit") {
            users = s.users.map((u) =>
              u.id === tx.userId ? { ...u, cashBalance: u.cashBalance + tx.amount - tx.fee } : u,
            );
          }
          if (tx && status === "Completed" && tx.type === "Withdrawal") {
            users = s.users.map((u) =>
              u.id === tx.userId ? { ...u, cashBalance: Math.max(0, u.cashBalance - tx.amount) } : u,
            );
          }
          return {
            ...s,
            users,
            transactions: s.transactions.map((t) => (t.id === id ? { ...t, status, note: note ?? t.note } : t)),
            audit: [
              {
                id: makeRef("aud"),
                at: nowIso(),
                actor: "console.operator",
                role: s.adminRole,
                action: `${tx?.type ?? "Transaction"} ${status.toLowerCase()}`,
                target: tx?.reference ?? id,
                detail: note ?? `Status set to ${status}`,
              },
              ...s.audit,
            ],
          };
        });
      },
      invest: (strategyId, amount) => {
        if (!currentUser) return { ok: false, error: "Sign in to allocate capital." };
        const strategy = state.strategies.find((s) => s.id === strategyId);
        if (!strategy) return { ok: false, error: "Strategy unavailable." };
        if (amount < strategy.minInvestment)
          return { ok: false, error: `Minimum allocation is ${strategy.minInvestment.toLocaleString()} USD.` };
        if (amount > currentUser.cashBalance)
          return { ok: false, error: "Insufficient available cash. Make a deposit first." };
        const investment: Investment = {
          id: makeRef("inv").toLowerCase(),
          userId: currentUser.id,
          strategyId,
          amount,
          currentValue: amount,
          status: "Pending",
          startedAt: nowIso(),
        };
        setState((s) => ({
          ...s,
          investments: [investment, ...s.investments],
          users: s.users.map((u) => (u.id === currentUser.id ? { ...u, cashBalance: u.cashBalance - amount } : u)),
          transactions: [
            {
              id: makeRef("tx").toLowerCase(),
              userId: currentUser.id,
              reference: makeRef("ALC"),
              type: "Allocation",
              amount,
              fee: 0,
              status: "Completed",
              createdAt: nowIso(),
              note: strategy.name,
            },
            ...s.transactions,
          ],
        }));
        return { ok: true };
      },
      setInvestmentStatus: (id, status) =>
        setState((s) => ({
          ...s,
          investments: s.investments.map((i) => (i.id === id ? { ...i, status } : i)),
        })),
      uploadDocument: (type, fileName) => {
        if (!currentUser) return;
        setState((s) => ({
          ...s,
          documents: [
            { id: makeRef("doc").toLowerCase(), userId: currentUser.id, type, fileName, status: "Under review", uploadedAt: nowIso() },
            ...s.documents,
          ],
          users: s.users.map((u) =>
            u.id === currentUser.id && u.kycStatus !== "Verified" ? { ...u, kycStatus: "Under review" } : u,
          ),
        }));
      },
      setDocumentStatus: (id, status) =>
        setState((s) => ({
          ...s,
          documents: s.documents.map((d) => (d.id === id ? { ...d, status } : d)),
        })),
      setUserKyc: (userId, status) => {
        patchUser(userId, { kycStatus: status });
        log("KYC status changed", userId, `Set to ${status}`);
      },
      setUserStatus: (userId, status) => {
        patchUser(userId, { accountStatus: status });
        log("Account status changed", userId, `Set to ${status}`);
      },
      toggleTwoFactor: () => {
        if (!currentUser) return;
        patchUser(currentUser.id, { twoFactor: !currentUser.twoFactor });
      },
      revokeSession: (id) => {
        if (!currentUser) return;
        patchUser(currentUser.id, { sessions: currentUser.sessions.filter((s) => s.id !== id) });
      },
      createTicket: ({ subject, category, priority, body }) => {
        if (!currentUser) return;
        setState((s) => ({
          ...s,
          tickets: [
            {
              id: makeRef("tkt").toLowerCase(),
              userId: currentUser.id,
              subject,
              category,
              priority,
              status: "Open",
              createdAt: nowIso(),
              messages: [{ from: "client", body, at: nowIso() }],
            },
            ...s.tickets,
          ],
        }));
      },
      replyTicket: (id, body, from) =>
        setState((s) => ({
          ...s,
          tickets: s.tickets.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: from === "desk" ? "Awaiting client" : "Open",
                  messages: [...t.messages, { from, body, at: nowIso() }],
                }
              : t,
          ),
        })),
      setTicketStatus: (id, status) =>
        setState((s) => ({ ...s, tickets: s.tickets.map((t) => (t.id === id ? { ...t, status } : t)) })),
      upsertStrategy: (strategy) => {
        setState((s) => ({
          ...s,
          strategies: s.strategies.some((x) => x.id === strategy.id)
            ? s.strategies.map((x) => (x.id === strategy.id ? strategy : x))
            : [...s.strategies, strategy],
        }));
        log("Strategy saved", strategy.id, `${strategy.name} · target ${strategy.targetMonthly}% monthly (illustrative)`);
      },
      updateAssetWeights: (assets) => {
        setState((s) => ({ ...s, assets }));
        log("Portfolio rebalanced", "portfolio", assets.map((a) => `${a.symbol} ${a.weight}%`).join(", "));
      },
      updateStats: (patch) => {
        setState((s) => ({ ...s, stats: { ...s.stats, ...patch, lastUpdated: nowIso() } }));
        log("Transparency figures updated", "platform-stats", Object.keys(patch).join(", "));
      },
      addAnnouncement: (title, body) => {
        setState((s) => ({
          ...s,
          announcements: [{ id: makeRef("ann").toLowerCase(), title, body, at: nowIso() }, ...s.announcements],
        }));
        log("Announcement published", "announcements", title);
      },
      reset: () => {
        setState(initialState);
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          /* noop */
        }
      },
    }),
    [state, currentUser, log, patchUser],
  );

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
