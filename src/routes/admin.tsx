import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { RiskBadge, StatusBadge } from "@/components/site/badges";
import { Logo } from "@/components/site/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { compactUsd, dateTime, shortDate, usd } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { AdminRole, KycStatus, TxType } from "@/lib/types";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Console — Meridian" },
      { name: "description", content: "Meridian operations, compliance and finance console." },
      { property: "og:title", content: "Admin Console — Meridian" },
      { property: "og:description", content: "Internal operations console." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

const sections = ["Overview", "Users", "KYC", "Investments", "Strategies", "Portfolio", "Assets", "Transactions", "Deposits", "Withdrawals", "Performance", "Reports", "Documents", "Announcements", "Support", "Audit Logs", "Settings"] as const;
type Sec = (typeof sections)[number];
const roles: AdminRole[] = ["Super Admin", "Compliance Admin", "Finance Admin", "Support Admin", "Read Only Admin"];

const perms: Record<AdminRole, Sec[] | "all"> = {
  "Super Admin": "all",
  "Compliance Admin": ["Users", "KYC", "Documents", "Withdrawals"],
  "Finance Admin": ["Transactions", "Deposits", "Withdrawals", "Investments", "Strategies", "Portfolio", "Assets", "Performance", "Reports"],
  "Support Admin": ["Support", "Announcements"],
  "Read Only Admin": [],
};

function Admin() {
  const s = useStore();
  const [sec, setSec] = useState<Sec>("Overview");
  const p = perms[s.adminRole];
  const canEdit = p === "all" || p.includes(sec);
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-56 shrink-0 border-r border-border/70 bg-card/40 p-4 md:block">
        <Logo />
        <p className="mt-2 text-[10px] uppercase tracking-widest text-primary">Admin console</p>
        <nav className="mt-6 flex flex-col gap-0.5">
          {sections.map((x) => <button key={x} onClick={() => setSec(x)} className={`rounded-md px-3 py-1.5 text-left text-sm ${sec === x ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}>{x}</button>)}
        </nav>
        <Link to="/" className="mt-6 block px-3 text-xs text-muted-foreground underline">Back to site</Link>
      </aside>
      <main className="min-w-0 flex-1 p-6 md:p-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold">{sec}</h1>
          <div className="flex items-center gap-2">
            <div className="md:hidden"><Select value={sec} onValueChange={(v) => setSec(v as Sec)}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent>{sections.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent></Select></div>
            <Select value={s.adminRole} onValueChange={(v) => s.setAdminRole(v as AdminRole)}><SelectTrigger className="w-48"><SelectValue /></SelectTrigger><SelectContent>{roles.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select>
          </div>
        </div>
        {!canEdit && sec !== "Overview" && sec !== "Audit Logs" && <p className="mb-4 rounded-md border border-warning/40 bg-warning/10 p-3 text-xs text-warning">Read-only: your role ({s.adminRole}) cannot modify {sec}.</p>}
        <Panel sec={sec} canEdit={canEdit} />
      </main>
    </div>
  );
}

function Stat({ l, v }: { l: string; v: string }) {
  return <Card className="surface"><CardContent className="p-5"><p className="text-[11px] uppercase tracking-widest text-muted-foreground">{l}</p><p className="mt-2 font-mono text-xl">{v}</p></CardContent></Card>;
}

function Row({ children }: { children: React.ReactNode }) {
  return <Card className="surface mb-2"><CardContent className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">{children}</CardContent></Card>;
}

function Panel({ sec, canEdit }: { sec: Sec; canEdit: boolean }) {
  const s = useStore();
  const [note, setNote] = useState("");
  const [ann, setAnn] = useState({ title: "", body: "" });
  const [weights, setWeights] = useState(() => s.assets.map((a) => ({ ...a })));
  const [stats, setStats] = useState({ aum: s.stats.aum, investors: s.stats.investors, avgMonthlyTarget: s.stats.avgMonthlyTarget });
  const [reply, setReply] = useState("");
  const userName = (id: string) => s.users.find((u) => u.id === id)?.name ?? id;
  const guard = (fn: () => void) => () => (canEdit ? fn() : toast.error("Your role does not permit this action"));

  const txList = (type?: TxType) => {
    const rows = s.transactions.filter((t) => !type || t.type === type);
    return rows.map((t) => (
      <Row key={t.id}>
        <span className="min-w-[220px]"><span className="font-mono text-xs">{t.reference}</span> · {t.type} · {userName(t.userId)}<br /><span className="text-xs text-muted-foreground">{shortDate(t.createdAt)} {t.destination ? `→ ${t.destination}` : ""}</span></span>
        <span className="font-mono">{usd(t.amount)}</span>
        <StatusBadge status={t.status} />
        {(t.status === "Pending" || t.status === "Processing") && (type === "Deposit" || type === "Withdrawal") && (
          <span className="flex gap-2">
            {t.status === "Pending" && <Button size="sm" variant="outline" onClick={guard(() => s.setTransactionStatus(t.id, "Processing", note || undefined))}>Review</Button>}
            <Button size="sm" onClick={guard(() => { s.setTransactionStatus(t.id, "Completed", note || undefined); toast.success("Approved"); })}>Approve</Button>
            <Button size="sm" variant="destructive" onClick={guard(() => { s.setTransactionStatus(t.id, "Rejected", note || "Rejected by compliance"); toast.success("Rejected"); })}>Reject</Button>
          </span>
        )}
      </Row>
    ));
  };

  switch (sec) {
    case "Overview": {
      const pend = s.transactions.filter((t) => t.status === "Pending").length;
      return (<>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat l="AUM" v={compactUsd(s.stats.aum)} /><Stat l="Investors" v={s.stats.investors.toLocaleString()} />
          <Stat l="Pending transactions" v={String(pend)} /><Stat l="KYC queue" v={String(s.users.filter((u) => u.kycStatus === "Under review" || u.kycStatus === "Pending").length)} />
        </div>
        <h2 className="mb-3 mt-8 font-semibold">Recent audit activity</h2>
        {s.audit.slice(0, 6).map((a) => <Row key={a.id}><span>{a.action} · <span className="text-muted-foreground">{a.target}</span></span><span className="text-xs text-muted-foreground">{a.role} · {dateTime(a.at)}</span></Row>)}
      </>);
    }
    case "Users":
      return <>{s.users.map((u) => <Row key={u.id}><span className="min-w-[200px]">{u.name}<br /><span className="text-xs text-muted-foreground">{u.email} · {u.country}</span></span><span className="font-mono">{usd(u.cashBalance)}</span><StatusBadge status={u.accountStatus} /><Select value={u.accountStatus} onValueChange={(v) => canEdit ? s.setUserStatus(u.id, v as typeof u.accountStatus) : toast.error("Not permitted")}><SelectTrigger className="w-36"><SelectValue /></SelectTrigger><SelectContent>{["Active", "Restricted", "Suspended"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent></Select></Row>)}</>;
    case "KYC":
      return <>{s.users.map((u) => <Row key={u.id}><span className="min-w-[200px]">{u.name}</span><StatusBadge status={u.kycStatus} /><span className="flex gap-2">{(["Under review", "Verified", "Rejected"] as KycStatus[]).map((k) => <Button key={k} size="sm" variant={k === "Rejected" ? "destructive" : k === "Verified" ? "default" : "outline"} onClick={guard(() => s.setUserKyc(u.id, k))}>{k}</Button>)}</span></Row>)}</>;
    case "Documents":
      return <>{s.documents.map((d) => <Row key={d.id}><span>{d.type} · {userName(d.userId)} <span className="text-xs text-muted-foreground">{d.fileName}</span></span><StatusBadge status={d.status} /><span className="flex gap-2"><Button size="sm" onClick={guard(() => { s.setDocumentStatus(d.id, "Verified"); s.log("Document verified", d.id, d.type); })}>Verify</Button><Button size="sm" variant="destructive" onClick={guard(() => { s.setDocumentStatus(d.id, "Rejected"); s.log("Document rejected", d.id, d.type); })}>Reject</Button></span></Row>)}</>;
    case "Investments":
      return <>{s.investments.map((i) => <Row key={i.id}><span>{userName(i.userId)} · {s.strategies.find((x) => x.id === i.strategyId)?.name}</span><span className="font-mono">{usd(i.amount)}</span><StatusBadge status={i.status} />{i.status === "Pending" && <Button size="sm" onClick={guard(() => { s.setInvestmentStatus(i.id, "Active"); s.log("Investment activated", i.id, usd(i.amount)); })}>Deploy capital</Button>}</Row>)}</>;
    case "Strategies":
      return <>{s.strategies.map((st) => <Card key={st.id} className="surface mb-3"><CardContent className="flex flex-wrap items-center gap-4 p-4 text-sm">
        <span className="min-w-[180px] font-medium">{st.name}</span><RiskBadge level={st.risk} />
        <label className="flex items-center gap-2 text-xs">Target %/mo<Input type="number" step="0.1" className="w-20" defaultValue={st.targetMonthly} onBlur={(e) => canEdit && Number(e.target.value) !== st.targetMonthly && s.upsertStrategy({ ...st, targetMonthly: Number(e.target.value) })} /></label>
        <label className="flex items-center gap-2 text-xs">Open<Switch checked={st.active} onCheckedChange={(v) => canEdit ? s.upsertStrategy({ ...st, active: v }) : toast.error("Not permitted")} /></label>
      </CardContent></Card>)}</>;
    case "Portfolio":
    case "Assets": {
      const total = weights.reduce((a, w) => a + w.weight, 0);
      return (<>
        {weights.map((w, i) => <Row key={w.id}><span className="min-w-[200px]">{w.name}</span><RiskBadge level={w.risk} /><Input type="number" className="w-24" value={w.weight} onChange={(e) => setWeights(weights.map((x, j) => j === i ? { ...x, weight: Number(e.target.value) } : x))} /></Row>)}
        <p className={`my-3 text-sm ${total === 100 ? "text-success" : "text-destructive"}`}>Total {total}%</p>
        <Button onClick={guard(() => total === 100 ? (s.updateAssetWeights(weights), toast.success("Rebalanced")) : toast.error("Weights must total 100%"))}>Save rebalance</Button>
      </>);
    }
    case "Transactions": return <>{txList()}</>;
    case "Deposits": case "Withdrawals":
      return <><Input placeholder="Review note (attached to next action)" className="mb-4 max-w-md" value={note} onChange={(e) => setNote(e.target.value)} />{txList(sec === "Deposits" ? "Deposit" : "Withdrawal")}</>;
    case "Performance": case "Reports":
      return (<Card className="surface max-w-xl"><CardContent className="space-y-3 p-6">
        <p className="text-sm text-muted-foreground">Public transparency figures · last updated {dateTime(s.stats.lastUpdated)}</p>
        {(["aum", "investors", "avgMonthlyTarget"] as const).map((k) => <label key={k} className="flex items-center justify-between gap-3 text-sm">{k}<Input type="number" className="w-48" value={stats[k]} onChange={(e) => setStats({ ...stats, [k]: Number(e.target.value) })} /></label>)}
        <Button onClick={guard(() => { s.updateStats(stats); toast.success("Published"); })}>Publish figures</Button>
      </CardContent></Card>);
    case "Announcements":
      return (<>
        <Card className="surface mb-6 max-w-xl"><CardContent className="space-y-3 p-6">
          <Input placeholder="Title" value={ann.title} onChange={(e) => setAnn({ ...ann, title: e.target.value })} />
          <Textarea placeholder="Body" value={ann.body} onChange={(e) => setAnn({ ...ann, body: e.target.value })} />
          <Button onClick={guard(() => { if (!ann.title.trim()) { toast.error("Title required"); return; } s.addAnnouncement(ann.title, ann.body); setAnn({ title: "", body: "" }); })}>Publish</Button>
        </CardContent></Card>
        {s.announcements.map((a) => <Row key={a.id}><span>{a.title}</span><span className="text-xs text-muted-foreground">{shortDate(a.at)}</span></Row>)}
      </>);
    case "Support":
      return <>{s.tickets.map((t) => <Card key={t.id} className="surface mb-3"><CardContent className="space-y-2 p-4 text-sm">
        <div className="flex items-center justify-between"><span className="font-medium">{t.subject} · <span className="text-muted-foreground">{userName(t.userId)}</span></span><StatusBadge status={t.status} /></div>
        {t.messages.map((m, i) => <p key={i} className="text-muted-foreground"><b className="text-foreground">{m.from}:</b> {m.body}</p>)}
        <div className="flex gap-2"><Input placeholder="Reply as desk" value={reply} onChange={(e) => setReply(e.target.value)} /><Button size="sm" onClick={guard(() => { if (reply.trim()) { s.replyTicket(t.id, reply.trim(), "desk"); setReply(""); } })}>Reply</Button><Button size="sm" variant="outline" onClick={guard(() => s.setTicketStatus(t.id, "Resolved"))}>Resolve</Button></div>
      </CardContent></Card>)}</>;
    case "Audit Logs":
      return (<div className="overflow-x-auto rounded-xl border border-border/70"><table className="w-full min-w-[720px] text-sm"><thead className="bg-muted/20 text-left text-xs uppercase tracking-widest text-muted-foreground"><tr><th className="p-3">Time</th><th className="p-3">Role</th><th className="p-3">Action</th><th className="p-3">Target</th><th className="p-3">Detail</th></tr></thead>
        <tbody>{s.audit.map((a) => <tr key={a.id} className="border-t border-border/50"><td className="p-3 text-xs">{dateTime(a.at)}</td><td className="p-3">{a.role}</td><td className="p-3">{a.action}</td><td className="p-3 font-mono text-xs">{a.target}</td><td className="p-3 text-muted-foreground">{a.detail}</td></tr>)}</tbody></table></div>);
    case "Settings":
      return <Card className="surface max-w-xl"><CardContent className="space-y-3 p-6"><p className="text-sm text-muted-foreground">Reset all demo data to seed state.</p><Button variant="destructive" onClick={guard(() => { s.reset(); toast.success("Demo data reset"); })}>Reset demo data</Button></CardContent></Card>;
  }
}
