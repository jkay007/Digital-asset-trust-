import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowDownToLine, ArrowUpFromLine, BarChart3, Briefcase, FileText, LayoutDashboard, LifeBuoy, LogOut,
  MessageSquare, PieChart, Receipt, Shield, Sparkles, User as UserIcon, Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";

import { AllocationDonut, AllocationLegend } from "@/components/site/allocation-donut";
import { RiskBadge, StatusBadge } from "@/components/site/badges";
import { Disclaimer } from "@/components/site/disclaimer";
import { Logo } from "@/components/site/site-header";
import { PortfolioAdvisor } from "@/components/site/portfolio-advisor";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { dateTime, shortDate, usd } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Transaction } from "@/lib/types";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Investor Dashboard — Meridian" },
      { name: "description", content: "Your Meridian portfolio, investments, transactions and statements." },
      { property: "og:title", content: "Investor Dashboard — Meridian" },
      { property: "og:description", content: "Track your digital-asset strategy allocations." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

const nav = [
  ["overview", "Dashboard", LayoutDashboard], ["portfolio", "My Portfolio", PieChart], ["investments", "Investments", Briefcase], ["advisor", "AI Risk Review", Sparkles],
  ["performance", "Performance", BarChart3], ["transactions", "Transactions", Receipt], ["deposits", "Deposits", ArrowDownToLine],
  ["withdrawals", "Withdrawals", ArrowUpFromLine], ["documents", "Documents", FileText], ["statements", "Statements", Wallet],
  ["messages", "Messages", MessageSquare], ["profile", "Profile", UserIcon], ["security", "Security", Shield], ["support", "Support", LifeBuoy],
] as const;
type Section = (typeof nav)[number][0];

function Dashboard() {
  const store = useStore();
  const navigate = useNavigate();
  const [section, setSection] = useState<Section>("overview");
  const user = store.currentUser;

  if (!user)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center">
        <h1 className="text-2xl font-semibold">Sign in to view your dashboard</h1>
        <Button asChild><Link to="/login">Go to login</Link></Button>
      </div>
    );

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border/70 bg-card/40 p-4 md:flex">
        <Logo />
        <nav className="mt-8 flex flex-col gap-1" aria-label="Dashboard">
          {nav.map(([k, label, Icon]) => (
            <button key={k} onClick={() => setSection(k)} className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${section === k ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"}`}>
              <Icon className="size-4" aria-hidden />{label}
            </button>
          ))}
          <button onClick={() => { store.logout(); navigate({ to: "/", replace: true }); }} className="mt-4 flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-destructive">
            <LogOut className="size-4" />Logout
          </button>
        </nav>
      </aside>
      <main className="min-w-0 flex-1 p-6 md:p-10">
        <div className="mb-6 md:hidden">
          <Select value={section} onValueChange={(v) => setSection(v as Section)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{nav.map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <Body section={section} go={setSection} />
      </main>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card className="surface"><CardContent className="p-5">
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-2 font-mono text-2xl">{value}</p>
      {sub ? <p className="mt-1 text-xs text-muted-foreground">{sub}</p> : null}
    </CardContent></Card>
  );
}

function H({ title, sub }: { title: string; sub?: string }) {
  return <div className="mb-6"><h1 className="text-2xl font-semibold">{title}</h1>{sub ? <p className="mt-1 text-sm text-muted-foreground">{sub}</p> : null}</div>;
}

function TxTable({ rows }: { rows: Transaction[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border/70">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="bg-muted/20 text-left text-xs uppercase tracking-widest text-muted-foreground">
          <tr><th className="p-3">Reference</th><th className="p-3">Type</th><th className="p-3">Amount</th><th className="p-3">Fee</th><th className="p-3">Status</th><th className="p-3">Date</th></tr>
        </thead>
        <tbody>
          {rows.map((t) => (
            <tr key={t.id} className="border-t border-border/50">
              <td className="p-3 font-mono text-xs">{t.reference}</td><td className="p-3">{t.type}</td>
              <td className="p-3 font-mono">{usd(t.amount)}</td><td className="p-3 font-mono text-muted-foreground">{usd(t.fee)}</td>
              <td className="p-3"><StatusBadge status={t.status} /></td><td className="p-3 text-muted-foreground">{shortDate(t.createdAt)}</td>
            </tr>
          ))}
          {rows.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No transactions</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function Body({ section, go }: { section: Section; go: (s: Section) => void }) {
  const s = useStore();
  const user = s.currentUser!;
  const invs = s.investments.filter((i) => i.userId === user.id);
  const txs = s.transactions.filter((t) => t.userId === user.id);
  const invested = invs.reduce((a, i) => a + i.amount, 0);
  const value = invs.reduce((a, i) => a + i.currentValue, 0);
  const history = useMemo(() => {
    const base = Math.max(invested, 10000);
    return Array.from({ length: 12 }, (_, m) => ({
      m: new Date(2025, 9 + m, 1).toLocaleDateString("en-GB", { month: "short" }),
      value: Math.round(base * (0.9 + m * 0.012 + Math.sin(m) * 0.02)),
    }));
  }, [invested]);

  const [filter, setFilter] = useState("All");
  const [amount, setAmount] = useState(5000);
  const [method, setMethod] = useState("Bank transfer");
  const [step, setStep] = useState(0);
  const [ref, setRef] = useState("");
  const [wAmt, setWAmt] = useState(1000);
  const [dest, setDest] = useState("");
  const [allocate, setAllocate] = useState<Record<string, number>>({});
  const [ticket, setTicket] = useState({ subject: "", body: "" });
  const [reply, setReply] = useState("");

  switch (section) {
    case "overview":
      return (<>
        <H title={`Welcome, ${user.name.split(" ")[0]}`} sub={`KYC: ${user.kycStatus} · Tier: ${user.tier}`} />
        {user.kycStatus !== "Verified" && <Disclaimer variant="strong" className="mb-6">Complete identity verification in Documents before funding your account.</Disclaimer>}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Portfolio value" value={usd(value)} sub="Mark-to-market" />
          <Stat label="Invested" value={usd(invested)} />
          <Stat label="Unrealised P/L" value={usd(value - invested)} sub="Not guaranteed; can be negative" />
          <Stat label="Available cash" value={usd(user.cashBalance)} />
        </div>
        <Card className="surface mt-6"><CardContent className="p-6">
          <p className="mb-4 text-sm font-medium">Portfolio value history (illustrative)</p>
          <div className="h-64"><ResponsiveContainer><AreaChart data={history}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={12} />
            <YAxis stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(v) => `$${Math.round(v / 1000)}k`} />
            <Tooltip formatter={(v: number) => usd(v)} contentStyle={{ background: "var(--card)", border: "1px solid var(--border)" }} />
            <Area dataKey="value" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.15} />
          </AreaChart></ResponsiveContainer></div>
        </CardContent></Card>
        <div className="mt-6 flex gap-3"><Button onClick={() => go("deposits")}>Deposit</Button><Button variant="outline" onClick={() => go("investments")}>Allocate</Button></div>
        {s.announcements[0] && <Card className="surface mt-6"><CardContent className="p-5"><p className="text-xs uppercase tracking-widest text-primary">Announcement</p><p className="mt-2 font-medium">{s.announcements[0].title}</p><p className="text-sm text-muted-foreground">{s.announcements[0].body}</p></CardContent></Card>}
      </>);
    case "portfolio":
      return (<>
        <H title="My Portfolio" sub="Underlying allocation across platform strategies" />
        <Card className="surface"><CardContent className="grid gap-6 p-6 sm:grid-cols-2"><AllocationDonut assets={s.assets} height={240} /><AllocationLegend assets={s.assets} /></CardContent></Card>
      </>);
    case "investments":
      return (<>
        <H title="Investments" sub={`Available cash ${usd(user.cashBalance)}`} />
        <div className="grid gap-4 lg:grid-cols-2">
          {invs.map((i) => { const st = s.strategies.find((x) => x.id === i.strategyId); return (
            <Card key={i.id} className="surface"><CardContent className="p-5">
              <div className="flex items-center justify-between"><p className="font-medium">{st?.name}</p><StatusBadge status={i.status} /></div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm"><span className="text-muted-foreground">Invested</span><span className="font-mono">{usd(i.amount)}</span><span className="text-muted-foreground">Current value</span><span className="font-mono">{usd(i.currentValue)}</span><span className="text-muted-foreground">Since</span><span>{shortDate(i.startedAt)}</span></div>
            </CardContent></Card>); })}
        </div>
        <h2 className="mb-4 mt-10 text-lg font-semibold">Allocate to a strategy</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {s.strategies.filter((x) => x.active).map((st) => (
            <Card key={st.id} className="surface"><CardContent className="space-y-3 p-5">
              <div className="flex items-center justify-between"><p className="font-medium">{st.name}</p><RiskBadge level={st.risk} /></div>
              <p className="text-xs text-muted-foreground">Target {st.targetMonthly}%/month (illustrative, not guaranteed) · Min {usd(st.minInvestment)}</p>
              <div className="flex gap-2">
                <Input type="number" value={allocate[st.id] ?? st.minInvestment} onChange={(e) => setAllocate({ ...allocate, [st.id]: Number(e.target.value) })} />
                <Button onClick={() => { const r = s.invest(st.id, allocate[st.id] ?? st.minInvestment); r.ok ? toast.success("Allocation submitted — pending deployment") : toast.error(r.error); }}>Allocate</Button>
              </div>
            </CardContent></Card>
          ))}
        </div>
      </>);
    case "advisor":
      return (<><H title="AI Risk Review" sub="Enter your holdings and goals for an AI-powered explanation of allocation risks and diversification" /><PortfolioAdvisor /></>);
    case "performance":
      return (<>
        <H title="Performance" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Total return" value={invested ? `${(((value - invested) / invested) * 100).toFixed(2)}%` : "—"} sub="Since inception, net of fees" />
          <Stat label="Positions" value={String(invs.length)} /><Stat label="Portfolio value" value={usd(value)} />
        </div>
        <Disclaimer className="mt-6" />
      </>);
    case "transactions": {
      const rows = filter === "All" ? txs : txs.filter((t) => t.type === filter || t.status === filter);
      return (<>
        <H title="Transactions" />
        <div className="mb-4 flex flex-wrap gap-2">
          {["All", "Deposit", "Withdrawal", "Allocation", "Yield", "Pending", "Completed"].map((f) => <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)}>{f}</Button>)}
        </div>
        <TxTable rows={rows} />
      </>);
    }
    case "deposits": {
      const fee = method === "Card" ? amount * 0.025 : method === "USDC" ? 5 : 0;
      const steps = ["Amount", "Payment method", "Review", "Confirmation"];
      return (<>
        <H title="Deposit funds" />
        <div className="mb-6 flex gap-2">{steps.map((l, i) => <div key={l} className={`flex-1 rounded-md border px-3 py-2 text-xs ${i <= step ? "border-primary/50 text-primary" : "border-border text-muted-foreground"}`}>{i + 1}. {l}</div>)}</div>
        <Card className="surface max-w-xl"><CardContent className="space-y-4 p-6">
          {step === 0 && <><Label htmlFor="amt">Amount (USD)</Label><Input id="amt" type="number" min={100} value={amount} onChange={(e) => setAmount(Number(e.target.value))} /><Button onClick={() => amount >= 100 ? setStep(1) : toast.error("Minimum deposit is $100")}>Continue</Button></>}
          {step === 1 && <>{["Bank transfer", "Card", "USDC"].map((m) => <button key={m} onClick={() => setMethod(m)} className={`w-full rounded-md border p-3 text-left text-sm ${method === m ? "border-primary bg-primary/10" : "border-border"}`}>{m}</button>)}<div className="flex gap-2"><Button variant="outline" onClick={() => setStep(0)}>Back</Button><Button onClick={() => setStep(2)}>Continue</Button></div></>}
          {step === 2 && <><div className="grid grid-cols-2 gap-2 text-sm"><span className="text-muted-foreground">Amount</span><span className="font-mono">{usd(amount)}</span><span className="text-muted-foreground">Method</span><span>{method}</span><span className="text-muted-foreground">Fee</span><span className="font-mono">{usd(fee, 2)}</span><span className="text-muted-foreground">Credited</span><span className="font-mono">{usd(amount - fee, 2)}</span></div><div className="flex gap-2"><Button variant="outline" onClick={() => setStep(1)}>Back</Button><Button onClick={() => { const tx = s.createDeposit({ amount, method, fee }); setRef(tx.reference); setStep(3); }}>Confirm deposit</Button></div></>}
          {step === 3 && <><p className="text-sm">Deposit submitted for compliance review.</p><p className="font-mono text-lg text-primary">{ref}</p><Button onClick={() => setStep(0)}>New deposit</Button></>}
        </CardContent></Card>
        <div className="mt-8"><TxTable rows={txs.filter((t) => t.type === "Deposit")} /></div>
      </>);
    }
    case "withdrawals":
      return (<>
        <H title="Withdrawals" sub="All withdrawals pass compliance review before release." />
        <Card className="surface max-w-xl"><CardContent className="space-y-4 p-6">
          <div><Label htmlFor="w">Amount</Label><Input id="w" type="number" value={wAmt} onChange={(e) => setWAmt(Number(e.target.value))} /></div>
          <div><Label htmlFor="d">Destination (bank IBAN or wallet)</Label><Input id="d" value={dest} maxLength={80} onChange={(e) => setDest(e.target.value)} /></div>
          <Button onClick={() => {
            if (user.kycStatus !== "Verified") { toast.error("Verification required before withdrawals"); return; }
            if (wAmt <= 0 || wAmt > user.cashBalance) { toast.error("Amount exceeds available cash"); return; }
            if (dest.trim().length < 6) { toast.error("Enter a valid destination"); return; }
            const tx = s.createWithdrawal({ amount: wAmt, destination: dest.trim(), fee: 0 }); toast.success(`Withdrawal ${tx.reference} pending compliance review`);
          }}>Request withdrawal</Button>
        </CardContent></Card>
        <div className="mt-8"><TxTable rows={txs.filter((t) => t.type === "Withdrawal")} /></div>
      </>);
    case "documents":
      return (<>
        <H title="Documents & verification" sub={`KYC status: ${user.kycStatus}`} />
        <div className="mb-6 flex flex-wrap gap-2">{["Passport", "Proof of address", "Source of funds"].map((t) => <Button key={t} variant="outline" onClick={() => { s.uploadDocument(t, `${t.toLowerCase().replace(/ /g, "-")}.pdf`); toast.success(`${t} uploaded`); }}>Upload {t}</Button>)}</div>
        <div className="space-y-2">{s.documents.filter((d) => d.userId === user.id).map((d) => <Card key={d.id} className="surface"><CardContent className="flex items-center justify-between p-4 text-sm"><span>{d.type} · <span className="text-muted-foreground">{d.fileName}</span></span><StatusBadge status={d.status} /></CardContent></Card>)}</div>
      </>);
    case "statements":
      return (<>
        <H title="Statements" />
        <div className="space-y-2">{["Aug 2026", "Jul 2026", "Jun 2026", "Q2 2026 tax summary"].map((m) => <Card key={m} className="surface"><CardContent className="flex items-center justify-between p-4 text-sm"><span>{m}</span><Button size="sm" variant="outline" onClick={() => toast.info("Statement PDF generation will be available once connected to the backend")}>Download</Button></CardContent></Card>)}</div>
      </>);
    case "messages":
      return (<><H title="Messages" />{s.announcements.map((a) => <Card key={a.id} className="surface mb-3"><CardContent className="p-5"><p className="font-medium">{a.title}</p><p className="text-sm text-muted-foreground">{a.body}</p><p className="mt-2 text-xs text-muted-foreground">{dateTime(a.at)}</p></CardContent></Card>)}</>);
    case "profile":
      return (<><H title="Profile" /><Card className="surface max-w-xl"><CardContent className="grid grid-cols-2 gap-3 p-6 text-sm">{[["Name", user.name], ["Email", user.email], ["Country", user.country], ["Tier", user.tier], ["Joined", shortDate(user.joinedAt)], ["Account", user.accountStatus]].flatMap(([k, v]) => [<span className="text-muted-foreground" key={k}>{k}</span>, <span key={`${k}v`}>{v}</span>])}</CardContent></Card></>);
    case "security":
      return (<>
        <H title="Security" />
        <Card className="surface max-w-xl"><CardContent className="flex items-center justify-between p-6"><div><p className="font-medium">Two-factor authentication</p><p className="text-sm text-muted-foreground">Required for withdrawals over $10,000</p></div><Switch checked={user.twoFactor} onCheckedChange={() => s.toggleTwoFactor()} /></CardContent></Card>
        <h2 className="mb-3 mt-8 font-semibold">Active sessions</h2>
        {user.sessions.map((se) => <Card key={se.id} className="surface mb-2"><CardContent className="flex items-center justify-between p-4 text-sm"><span>{se.device} · {se.location} · <span className="font-mono text-xs">{se.ip}</span></span>{se.current ? <span className="text-xs text-primary">This session</span> : <Button size="sm" variant="outline" onClick={() => s.revokeSession(se.id)}>Revoke</Button>}</CardContent></Card>)}
      </>);
    case "support": {
      const mine = s.tickets.filter((t) => t.userId === user.id);
      return (<>
        <H title="Support" />
        <Card className="surface max-w-xl"><CardContent className="space-y-3 p-6">
          <Input placeholder="Subject" maxLength={120} value={ticket.subject} onChange={(e) => setTicket({ ...ticket, subject: e.target.value })} />
          <Textarea placeholder="How can we help?" maxLength={1000} value={ticket.body} onChange={(e) => setTicket({ ...ticket, body: e.target.value })} />
          <Button onClick={() => { if (!ticket.subject.trim() || !ticket.body.trim()) { toast.error("Add a subject and message"); return; } s.createTicket({ ...ticket, category: "General", priority: "Normal" }); setTicket({ subject: "", body: "" }); toast.success("Ticket opened"); }}>Open ticket</Button>
        </CardContent></Card>
        <div className="mt-8 space-y-3">{mine.map((t) => (
          <Card key={t.id} className="surface"><CardContent className="space-y-2 p-5">
            <div className="flex items-center justify-between"><p className="font-medium">{t.subject}</p><StatusBadge status={t.status} /></div>
            {t.messages.map((m, i) => <p key={i} className={`rounded-md p-2 text-sm ${m.from === "desk" ? "bg-primary/10" : "bg-muted/30"}`}><span className="text-xs uppercase text-muted-foreground">{m.from === "desk" ? "Client desk" : "You"}: </span>{m.body}</p>)}
            <div className="flex gap-2"><Input placeholder="Reply" value={reply} onChange={(e) => setReply(e.target.value)} /><Button size="sm" onClick={() => { if (reply.trim()) { s.replyTicket(t.id, reply.trim(), "client"); setReply(""); } }}>Send</Button></div>
          </CardContent></Card>))}</div>
      </>);
    }
  }
}
