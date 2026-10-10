import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { z } from "zod";

const RUN_ID = "X-Lovable-AIG-Run-ID";

const Body = z.object({
  holdings: z.array(z.object({ name: z.string().max(80), amount: z.number().nonnegative() })).min(1).max(30),
  goal: z.string().max(80),
  horizon: z.string().max(40),
  risk: z.string().max(40),
  notes: z.string().max(1000).optional(),
});

const SYSTEM = `You are an educational portfolio-risk assistant for Meridian, a digital-asset investment platform.
Explain allocation risks and diversification considerations for the holdings and goals provided.
Structure with short markdown headings: Snapshot, Concentration & correlation, Risks by holding type, Fit with your goals, Diversification considerations, Questions to discuss with an adviser.
Rules: educational only, never personal financial advice, never recommend buying or selling specific products, never promise or predict returns, never say returns are guaranteed. Mention that digital assets are volatile and capital is at risk. Keep under 450 words.`;

export async function handlePortfolioReview(request: Request) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return Response.json({ error: "AI is not configured." }, { status: 500 });
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Please check your holdings and goals." }, { status: 400 });
  const d = parsed.data;
  const total = d.holdings.reduce((a, h) => a + h.amount, 0) || 1;
  const lines = d.holdings.map((h) => `- ${h.name}: $${h.amount.toLocaleString()} (${((h.amount / total) * 100).toFixed(1)}%)`).join("\n");
  const prompt = `Holdings (total $${total.toLocaleString()}):\n${lines}\n\nGoal: ${d.goal}\nTime horizon: ${d.horizon}\nRisk tolerance: ${d.risk}\nNotes: ${d.notes || "none"}`;

  let runId: string | undefined;
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: async (input, init) => {
      const headers = new Headers(init?.headers);
      if (runId) headers.set(RUN_ID, runId);
      const res = await fetch(input, { ...init, headers });
      runId ??= res.headers.get(RUN_ID) ?? undefined;
      if (!res.ok) {
        const status = res.status;
        const msg = status === 429 ? "Too many requests — please try again shortly." : status === 402 ? "AI credits are exhausted. Please add credits to continue." : "The AI service could not complete this request.";
        throw Object.assign(new Error(msg), { status });
      }
      return res;
    },
  });

  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"),
    system: SYSTEM,
    prompt,
    abortSignal: request.signal,
    providerOptions: {
      openai: { forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", store: false, include: ["reasoning.encrypted_content"] },
    },
  });

  // Surface upstream errors before streaming starts.
  const reader = result.fullStream[Symbol.asyncIterator]();
  const encoder = new TextEncoder();
  let first: IteratorResult<(typeof result.fullStream extends AsyncIterable<infer T> ? T : never)>;
  try {
    for (;;) {
      first = await reader.next();
      if (first.done) break;
      if (first.value.type === "error") throw first.value.error;
      if (first.value.type === "text-delta") break;
    }
  } catch (e) {
    const err = e as { status?: number; message?: string };
    return Response.json({ error: err.message || "AI request failed." }, { status: err.status ?? 502 });
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        if (!first.done && first.value.type === "text-delta") controller.enqueue(encoder.encode(first.value.text));
        for (;;) {
          const n = await reader.next();
          if (n.done) break;
          if (n.value.type === "text-delta") controller.enqueue(encoder.encode(n.value.text));
          if (n.value.type === "error") throw n.value.error;
        }
      } catch {
        controller.enqueue(encoder.encode("\n\n_The analysis was interrupted. Please try again._"));
      }
      controller.close();
    },
  });
  const headers = new Headers({ "Content-Type": "text/plain; charset=utf-8" });
  if (runId) headers.set(RUN_ID, runId);
  return new Response(stream, { headers });
}
