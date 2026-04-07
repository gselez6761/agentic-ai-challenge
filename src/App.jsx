import { useState, useEffect, useRef } from "react";

const COLORS = {
  moat: { Wide: "#10b981", Narrow: "#f59e0b", None: "#ef4444" },
  signal: { STRONG: "#10b981", WEAK: "#f59e0b" },
  style: { DIP: "#3b82f6", MOMENTUM: "#a855f7", NEUTRAL: "#64748b" },
  outcome: { GAIN: "#10b981", LOSS: "#ef4444", NEUTRAL: "#64748b" },
  sentiment: { BULLISH: "#10b981", NEUTRAL: "#f59e0b", BEARISH: "#ef4444" },
};

const fmt = (n) => (n >= 1e6 ? `$${(n / 1e6).toFixed(2)}M` : n >= 1e3 ? `$${(n / 1e3).toFixed(1)}K` : `$${n.toFixed(2)}`);

function Tag({ label, color }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px",
      borderRadius: 3, background: color + "15", color, fontSize: 10.5,
      fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
      border: `1px solid ${color}30`, fontFamily: "var(--mono)",
    }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}88` }} />{label}</span>
  );
}

function Card({ children, style: s, accent }) {
  return (
    <div style={{
      background: "var(--card)", border: "1px solid var(--line)", borderRadius: 5,
      padding: "18px 20px", borderLeft: accent ? `3px solid ${accent}` : undefined, ...s,
    }}>{children}</div>
  );
}

function SectionLabel({ icon, label, color }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 7, marginBottom: 14,
      fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.12em",
      color, fontWeight: 700, fontFamily: "var(--mono)",
    }}><span style={{ fontSize: 13 }}>{icon}</span>{label}</div>
  );
}

function ListItems({ items, color }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", gap: 11, fontSize: 13.5, lineHeight: 1.55, color: "var(--fg)", fontFamily: "var(--body)" }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: 10, color, opacity: 0.5, marginTop: 4, flexShrink: 0 }}>{String(i + 1).padStart(2, "0")}</span>
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}

function MetricBox({ label, value, color, note }) {
  return (
    <Card style={{ flex: 1, minWidth: 130 }}>
      <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--muted)", marginBottom: 5, fontFamily: "var(--mono)" }}>{label}</div>
      <div style={{ fontSize: 21, fontWeight: 800, color: color || "var(--fg)", fontFamily: "var(--display)" }}>{value}</div>
      {note && <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 3, fontFamily: "var(--body)" }}>{note}</div>}
    </Card>
  );
}

export default function Dashboard() {
  const [ticker, setTicker] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [phase, setPhase] = useState("");
  const ref = useRef(null);
  const sessionId = useRef(crypto.randomUUID());

  useEffect(() => { ref.current?.focus(); }, []);

  const run = async () => {
    if (!ticker.trim()) return;
    setLoading(true); setError(null); setData(null);
    const phases = ["Scanning earnings transcripts...", "Pulling stock fundamentals...", "Analyzing insider activity...", "Assessing management sentiment...", "Building catalyst timeline...", "Compiling research report..."];
    let i = 0; setPhase(phases[0]);
    const iv = setInterval(() => { i++; if (i < phases.length) setPhase(phases[i]); }, 3500);
    try {
      const WEBHOOK_URL = "https://codemachine.app.n8n.cloud/webhook-test/75a8d112-87cf-4bfb-a251-80df44398a1b";
      const payload = { chatInput: ticker.trim().toUpperCase(), sessionId: sessionId.current };
      console.log("[webhook] →", WEBHOOK_URL, payload);

      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      console.log("[webhook] status:", res.status, res.statusText);

      const raw = await res.json();
      console.log("[webhook] raw response:", raw);

      // n8n returns an array: [{ output: {...} }]
      const rawItem = Array.isArray(raw) ? raw[0] : raw;
      let p = rawItem.output || rawItem;
      console.log("[webhook] parsed output:", p);

      if (typeof p === "string") {
        console.log("[webhook] output is a string, attempting JSON.parse");
        p = JSON.parse(p.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim());
        console.log("[webhook] parsed from string:", p);
      }

      const tk = p.ticker || p.stock_info?.ticker || ticker.toUpperCase();
      const result = {
        stock_info: p.stock_info || { ticker: tk, moat: p.moat || null, industry: p.industry || "", sector: p.sector || "" },
        summary: p.summary || "",
        sentiment: p.sentiment || { rating: "NEUTRAL", justification: "" },
        insider_activity: p.insider_activity || { ticker: tk, transactions: [], analysis: null },
        insights: {
          ticker: tk,
          key_drivers: p.insights?.key_drivers || [],
          current_expectations: p.insights?.current_expectations || [],
          current_products_services: p.insights?.current_products_services || [],
          expected_future_products_services: p.insights?.expected_future_products_services || [],
          risk_factors: p.insights?.risk_factors || [],
        },
        catalysts: { dated: p.catalysts?.dated || [], undated: p.catalysts?.undated || [] },
        quality: p.quality || { transcripts_analyzed: 0, quarters_covered: [], insider_events: 0 },
      };

      console.log("[webhook] normalized result:", result);
      clearInterval(iv); setData(result);
    } catch (e) {
      console.error("[webhook] error:", e);
      clearInterval(iv); setError(e.message);
    }
    finally { setLoading(false); setPhase(""); }
  };

  const si = data?.stock_info, ia = data?.insider_activity, ins = data?.insights, an = ia?.analysis, cat = data?.catalysts, q = data?.quality, sen = data?.sentiment;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--fg)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&family=Outfit:wght@300;400;500;600;700;800&display=swap');
        :root {
          --bg: #08090d; --card: #0e1017; --line: #1a1d28; --fg: #d4d4dc;
          --muted: #5a5d6e; --accent: #3b82f6; --mono: 'DM Mono', monospace;
          --body: 'Outfit', sans-serif; --display: 'Instrument Serif', serif;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        input::placeholder { color: var(--muted); }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity: .4; } 50% { opacity: 1; } }
        @keyframes scan { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .fade { animation: fadeUp .4s ease forwards; }
      `}</style>

      {/* Nav */}
      <div style={{ borderBottom: "1px solid var(--line)", padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b98166" }} />
          <span style={{ fontFamily: "var(--mono)", fontWeight: 500, fontSize: 13, letterSpacing: "0.08em" }}>EQUITY RESEARCH TERMINAL</span>
        </div>
        <span style={{ fontFamily: "var(--mono)", fontSize: 10.5, color: "var(--muted)" }}>v2.0 — {new Date().toLocaleDateString()}</span>
      </div>

      <div style={{ padding: "24px 28px", maxWidth: 1240, margin: "0 auto" }}>
        {/* Search */}
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", background: "var(--card)", border: "1px solid var(--line)", borderRadius: 5, padding: "0 14px", height: 44 }}>
            <span style={{ color: "var(--accent)", fontFamily: "var(--mono)", fontSize: 13, marginRight: 8 }}>$</span>
            <input ref={ref} value={ticker} onChange={e => setTicker(e.target.value.toUpperCase())} onKeyDown={e => e.key === "Enter" && run()}
              placeholder="Enter ticker..." style={{ flex: 1, background: "none", border: "none", outline: "none", color: "var(--fg)", fontSize: 14, fontFamily: "var(--mono)", fontWeight: 500, letterSpacing: "0.05em" }} />
          </div>
          <button onClick={run} disabled={loading} style={{
            height: 44, padding: "0 22px", background: loading ? "var(--line)" : "var(--accent)",
            border: "none", borderRadius: 5, color: "#fff", fontSize: 11, fontFamily: "var(--mono)",
            fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", cursor: loading ? "wait" : "pointer",
          }}>{loading ? "ANALYZING" : "ANALYZE"}</button>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ marginTop: 18 }} className="fade">
            <div style={{ height: 2, background: "var(--line)", borderRadius: 1, overflow: "hidden", marginBottom: 10 }}>
              <div style={{ height: "100%", width: "35%", background: `linear-gradient(90deg, transparent, var(--accent), transparent)`, animation: "scan 1.8s ease infinite" }} />
            </div>
            <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--accent)", animation: "pulse 1.5s ease infinite" }}>{phase}</span>
          </div>
        )}

        {error && <div style={{ marginTop: 14, padding: "10px 14px", background: "#ef444418", border: "1px solid #ef444433", borderRadius: 5, color: "#ef4444", fontSize: 11.5, fontFamily: "var(--mono)" }}>ERROR: {error}</div>}

        {/* Dashboard */}
        {data && (
          <div style={{ marginTop: 22 }} className="fade">

            {/* Header Row */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 6 }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: 42, fontWeight: 700, color: "var(--fg)", letterSpacing: "-0.02em" }}>{si?.ticker}</span>
              <span style={{ color: "var(--muted)", fontSize: 14, fontFamily: "var(--body)" }}>{si?.industry}</span>
              <span style={{ color: "var(--muted)", fontSize: 12 }}>·</span>
              <span style={{ color: "var(--muted)", fontSize: 14, fontFamily: "var(--body)" }}>{si?.sector}</span>
              <div style={{ marginLeft: "auto", display: "flex", gap: 7 }}>
                <Tag label={`Moat: ${si?.moat || "N/A"}`} color={COLORS.moat[si?.moat] || "#64748b"} />
                <Tag label={sen?.rating} color={COLORS.sentiment[sen?.rating] || "#64748b"} />
              </div>
            </div>

            {/* Quality bar */}
            <div style={{ display: "flex", gap: 16, marginBottom: 18, fontSize: 10.5, color: "var(--muted)", fontFamily: "var(--mono)" }}>
              <span>{q?.transcripts_analyzed} transcript{q?.transcripts_analyzed !== 1 ? "s" : ""} analyzed</span>
              <span>·</span>
              <span>{q?.quarters_covered?.join(", ")}</span>
            </div>

            {/* Summary */}
            <Card style={{ marginBottom: 14, borderLeft: "3px solid var(--accent)" }}>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--accent)", fontWeight: 700, fontFamily: "var(--mono)", marginBottom: 8 }}>Investment Thesis</div>
              <p style={{ fontSize: 15, lineHeight: 1.65, color: "var(--fg)", fontFamily: "var(--body)", fontWeight: 400 }}>{data.summary}</p>
            </Card>

            {/* Sentiment */}
            <Card style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  background: (COLORS.sentiment[sen?.rating] || "#64748b") + "18",
                  border: `2px solid ${COLORS.sentiment[sen?.rating] || "#64748b"}44`,
                }}>
                  <span style={{ fontSize: 18 }}>{sen?.rating === "BULLISH" ? "▲" : sen?.rating === "BEARISH" ? "▼" : "—"}</span>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.sentiment[sen?.rating] || "#64748b", fontFamily: "var(--mono)", letterSpacing: "0.06em" }}>MANAGEMENT SENTIMENT: {sen?.rating}</div>
                  <div style={{ fontSize: 13, color: "var(--fg)", fontFamily: "var(--body)", marginTop: 2 }}>{sen?.justification}</div>
                </div>
              </div>
            </Card>

            {/* Insights 2x2 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              <Card accent="#3b82f6"><SectionLabel icon="◆" label="Key Drivers" color="#3b82f6" /><ListItems items={ins?.key_drivers || []} color="#3b82f6" /></Card>
              <Card accent="#10b981"><SectionLabel icon="▲" label="Current Expectations" color="#10b981" /><ListItems items={ins?.current_expectations || []} color="#10b981" /></Card>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
              <Card accent="#a855f7"><SectionLabel icon="●" label="Products & Services" color="#a855f7" /><ListItems items={ins?.current_products_services || []} color="#a855f7" /></Card>
              <Card accent="#f59e0b"><SectionLabel icon="◇" label="Future Products" color="#f59e0b" /><ListItems items={ins?.expected_future_products_services || []} color="#f59e0b" /></Card>
            </div>

            {/* Risk + Catalysts side by side */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
              {/* Risk Factors */}
              <Card accent="#ef4444">
                <SectionLabel icon="⚠" label="Risk Factors" color="#ef4444" />
                <ListItems items={ins?.risk_factors || []} color="#ef4444" />
              </Card>

              {/* Catalyst Timeline */}
              <Card accent="#06b6d4">
                <SectionLabel icon="⏱" label="Catalyst Timeline" color="#06b6d4" />
                {/* Dated */}
                <div style={{ position: "relative", paddingLeft: 18, marginBottom: cat?.undated?.length ? 16 : 0 }}>
                  <div style={{ position: "absolute", left: 5, top: 4, bottom: 4, width: 1, background: "#06b6d433" }} />
                  {cat?.dated?.map((c, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, marginBottom: 12, position: "relative" }}>
                      <div style={{ position: "absolute", left: -15, top: 6, width: 7, height: 7, borderRadius: "50%", background: "#06b6d4", boxShadow: "0 0 6px #06b6d466" }} />
                      <div>
                        <div style={{ fontFamily: "var(--mono)", fontSize: 10.5, color: "#06b6d4", fontWeight: 500, marginBottom: 2 }}>{c.date}</div>
                        <div style={{ fontSize: 13, color: "var(--fg)", fontFamily: "var(--body)", lineHeight: 1.5 }}>{c.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Undated */}
                {cat?.undated?.length > 0 && (
                  <>
                    <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)", fontFamily: "var(--mono)", marginBottom: 8, paddingTop: 8, borderTop: "1px solid var(--line)" }}>Watch For</div>
                    {cat.undated.map((c, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, fontSize: 13, color: "var(--fg)", fontFamily: "var(--body)", lineHeight: 1.5 }}>
                        <span style={{ color: "var(--muted)", fontSize: 11, marginTop: 2 }}>◦</span>
                        <span>{c}</span>
                      </div>
                    ))}
                  </>
                )}
              </Card>
            </div>

          </div>
        )}

        {/* Empty State */}
        {!data && !loading && !error && (
          <div style={{ marginTop: 100, textAlign: "center", color: "var(--muted)" }} className="fade">
            <div style={{ fontFamily: "var(--mono)", fontSize: 56, color: "var(--line)", marginBottom: 14 }}>$_</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 13, letterSpacing: "0.06em" }}>Enter a ticker to generate an AI-powered equity research report</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10.5, marginTop: 8, opacity: .4 }}>
              Earnings transcripts · Insider signals · Sentiment analysis · Catalyst mapping
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
