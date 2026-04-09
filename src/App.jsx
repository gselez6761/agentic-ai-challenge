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

const DEBUG_FIXTURE = [{"output":{"subject":{"stock_info":{"ticker":"LINC","moat":"None","industry":"Education & Training Services","sector":"Consumer Defensive"},"summary":"LINC reported strong 2025 results with revenue up 19.7% to $518.2 million driven by 17.9% growth in average student population and 15.2% increase in starts. Adjusted EBITDA surged 60% to $67.1 million, supported by operating leverage and a debt-free balance sheet with $90 million liquidity. Management is confident entering 2026 with momentum and plans to share a 5-year outlook at Investor Day.","sentiment":{"rating":"BULLISH","justification":"Robust growth across key metrics, margin expansion, strong cash position, and optimistic tone on future expansion indicate positive momentum."},"insights":{"key_drivers":["Revenue grew 19.7% to $518.2M on 17.9% average student population growth and 15.2% rise in total starts with over half organic.","Adjusted EBITDA increased 60% to $67.1M, margin expanded 400bps to 20.4% in Q4 demonstrating operating leverage.","Q4 cash flow doubled to $59.3M with no debt and $29M cash."],"current_expectations":["Diluted shares outlook of 31.1-31.4M for Q1 2026 and ~31.2M for full year.","Strong momentum into 2026 with consistent execution of growth initiatives."],"current_products_services":["Core campus-based education programs driving enrollment growth.","Transitional segment contributing to EBITDA growth."],"expected_future_products_services":["New campuses with accelerated construction, 70% of $88M CapEx allocated to growth.","5-year strategic outlook to be presented at Investor Day."],"risk_factors":["Execution risk on new campus developments and $88M CapEx spend.","Regulatory compliance including 90/10 earnings test passed for all programs.","Macro and policy sensitivity in education sector.","Competitive pressures in training services amid enrollment trends."]},"catalysts":{"dated":[{"date":"2026-03-19","description":"Investor Day at Nashville campus featuring 5-year outlook"}],"undated":["Organic student starts growth initiatives","Expansion at existing campuses","New facility openings maintaining timelines"]},"quality":{"transcripts_analyzed":1,"quarters_covered":["Q4 2025"]}},"peer_analysis":{"peers":[{"ticker":"UTI","stock_info":{"moat":"Narrow","industry":"Education & Training Services","sector":"Consumer Defensive"},"sentiment":"BULLISH","key_signal":"Reiterating fiscal 2026 guidance with consolidated revenue of $905-915 million","revenue_growth":"FY2026 revenue $905-915M, approximately 9% YoY growth at midpoint","demand_language":"Investments into sustainable enrollment growth and new student starts between expected ranges","headwinds":["Growth investments causing Q2 net income and adjusted EBITDA contraction","Sales and marketing expenses up for new campuses"],"divergence_flag":false},{"ticker":"PRDO","stock_info":{"moat":"Narrow","industry":"Education & Training Services","sector":"Consumer Defensive"},"sentiment":"BULLISH","key_signal":"Updating full year 2025 adjusted operating income outlook to $234-236 million due to St. Augustine acquisition and positive trends","revenue_growth":"Adjusted operating income guidance $234-236M vs $188.9M in 2024 (24% growth)","demand_language":"Positive operating trends at CTU and AIU Systems; expanding corporate student program teams","headwinds":["Incremental depreciation and finance lease expenses from St. Augustine acquisition"],"divergence_flag":false}],"synthesis":"Both UTI and PRDO display bullish sentiment in the Education & Training Services sector, with UTI guiding 9% revenue growth to $905-915M for FY2026 amid enrollment investments, and PRDO raising adjusted operating income to $234-236M (24% above 2024's $188.9M) post-St. Augustine acquisition. Common themes include growth investments in enrollments, programs, and acquisitions driving mid-teens operating leverage. The peer set signals robust sector conditions with low double-digit to mid-20s percentage growth in key metrics."},"comparative_verdict":{"subject_vs_peers_sentiment":"Bullish, aligning with peers as all exhibit positive sentiment","shared_industry_tailwinds":["Growth in enrollments and student starts","Revenue and EBITDA increases from operational expansions"],"shared_industry_headwinds":["Growth investments leading to higher expenses","Regulatory and competitive pressures in the education sector"],"subject_differentiators":["Higher revenue growth rate of 19.7% for LINC compared to peers","LINC's debt-free balance sheet providing financial flexibility"],"signal_strength":"Strong"}}}];

export default function Dashboard() {
  const [ticker, setTicker] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [phase, setPhase] = useState("");
  const [debug, setDebug] = useState(false);
  const ref = useRef(null);
  const sessionId = useRef(crypto.randomUUID());

  useEffect(() => { ref.current?.focus(); }, []);

  const runDebug = () => {
    setError(null);
    const raw = DEBUG_FIXTURE;
    const rawItem = Array.isArray(raw) ? raw[0] : raw;
    const p = rawItem.output || rawItem;
    const subj = p.subject || p;
    const tk = subj.stock_info?.ticker || ticker.toUpperCase() || "DEBUG";
    setData({
      stock_info: subj.stock_info || { ticker: tk, moat: null, industry: "", sector: "" },
      summary: subj.summary || "",
      sentiment: subj.sentiment || { rating: "NEUTRAL", justification: "" },
      insights: {
        ticker: tk,
        key_drivers: subj.insights?.key_drivers || [],
        current_expectations: subj.insights?.current_expectations || [],
        current_products_services: subj.insights?.current_products_services || [],
        expected_future_products_services: subj.insights?.expected_future_products_services || [],
        risk_factors: subj.insights?.risk_factors || [],
      },
      catalysts: { dated: subj.catalysts?.dated || [], undated: subj.catalysts?.undated || [] },
      quality: subj.quality || { transcripts_analyzed: 0, quarters_covered: [] },
      peer_analysis: p.peer_analysis || null,
      comparative_verdict: p.comparative_verdict || null,
    });
  };

  const run = async () => {
    if (!ticker.trim()) return;
    if (debug) { runDebug(); return; }
    setLoading(true); setError(null); setData(null);
    const phases = ["Scanning earnings transcripts...", "Pulling stock fundamentals...", "Analyzing insider activity...", "Assessing management sentiment...", "Building catalyst timeline...", "Compiling research report..."];
    let i = 0; setPhase(phases[0]);
    const iv = setInterval(() => { i++; if (i < phases.length) setPhase(phases[i]); }, 3500);
    try {
      const WEBHOOK_URL = "https://codemachine.app.n8n.cloud/webhook/ed36debd-2f06-448c-b98e-ef138d3f692a";
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

      // New format: { subject: {...}, peer_analysis: {...}, comparative_verdict: {...} }
      // Old format: { stock_info: {...}, summary: ..., ... }
      const subj = p.subject || p;
      const tk = subj.stock_info?.ticker || subj.ticker || ticker.toUpperCase();
      const result = {
        stock_info: subj.stock_info || { ticker: tk, moat: subj.moat || null, industry: subj.industry || "", sector: subj.sector || "" },
        summary: subj.summary || "",
        sentiment: subj.sentiment || { rating: "NEUTRAL", justification: "" },
        insights: {
          ticker: tk,
          key_drivers: subj.insights?.key_drivers || [],
          current_expectations: subj.insights?.current_expectations || [],
          current_products_services: subj.insights?.current_products_services || [],
          expected_future_products_services: subj.insights?.expected_future_products_services || [],
          risk_factors: subj.insights?.risk_factors || [],
        },
        catalysts: { dated: subj.catalysts?.dated || [], undated: subj.catalysts?.undated || [] },
        quality: subj.quality || { transcripts_analyzed: 0, quarters_covered: [] },
        peer_analysis: p.peer_analysis || subj.peer_analysis || null,
        comparative_verdict: p.comparative_verdict || null,
      };

      console.log("[webhook] normalized result:", result);
      clearInterval(iv); setData(result);
    } catch (e) {
      console.error("[webhook] error:", e);
      clearInterval(iv); setError(e.message);
    }
    finally { setLoading(false); setPhase(""); }
  };

  const si = data?.stock_info, ins = data?.insights, cat = data?.catalysts, q = data?.quality, sen = data?.sentiment, pa = data?.peer_analysis, cv = data?.comparative_verdict;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--fg)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&family=Outfit:wght@300;400;500;600;700;800&display=swap');
        :root {
          --bg: #08090d; --card: #0e1017; --card2: #131520; --line: #1a1d28; --fg: #d4d4dc;
          --muted: #9499b0; --accent: #3b82f6; --cyan: #22d3ee; --amber: #f59e0b; --red: #f43f5e;
          --mono: 'DM Mono', monospace; --body: 'Outfit', sans-serif; --display: 'Instrument Serif', serif;
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
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => { setDebug(d => !d); setData(null); setError(null); }} style={{
            fontFamily: "var(--mono)", fontSize: 9.5, letterSpacing: "0.1em", textTransform: "uppercase",
            padding: "3px 10px", borderRadius: 3, cursor: "pointer", border: "1px solid",
            borderColor: debug ? "#f59e0b55" : "var(--line)",
            background: debug ? "rgba(245,158,11,.08)" : "transparent",
            color: debug ? "var(--amber)" : "var(--muted)",
          }}>{debug ? "⚡ DEBUG ON" : "DEBUG"}</button>
          <span style={{ fontFamily: "var(--mono)", fontSize: 10.5, color: "var(--muted)" }}>v2.0 — {new Date().toLocaleDateString()}</span>
        </div>
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
            {(ins?.key_drivers?.length > 0 || ins?.current_expectations?.length > 0) && (
              <div style={{ display: "grid", gridTemplateColumns: `${ins?.key_drivers?.length > 0 ? "1fr" : ""} ${ins?.current_expectations?.length > 0 ? "1fr" : ""}`.trim(), gap: 10, marginBottom: 10 }}>
                {ins?.key_drivers?.length > 0 && <Card accent="#3b82f6"><SectionLabel icon="◆" label="Key Drivers" color="#3b82f6" /><ListItems items={ins.key_drivers} color="#3b82f6" /></Card>}
                {ins?.current_expectations?.length > 0 && <Card accent="#10b981"><SectionLabel icon="▲" label="Current Expectations" color="#10b981" /><ListItems items={ins.current_expectations} color="#10b981" /></Card>}
              </div>
            )}
            {(ins?.current_products_services?.length > 0 || ins?.expected_future_products_services?.length > 0) && (
              <div style={{ display: "grid", gridTemplateColumns: `${ins?.current_products_services?.length > 0 ? "1fr" : ""} ${ins?.expected_future_products_services?.length > 0 ? "1fr" : ""}`.trim(), gap: 10, marginBottom: 18 }}>
                {ins?.current_products_services?.length > 0 && <Card accent="#a855f7"><SectionLabel icon="●" label="Products & Services" color="#a855f7" /><ListItems items={ins.current_products_services} color="#a855f7" /></Card>}
                {ins?.expected_future_products_services?.length > 0 && <Card accent="#f59e0b"><SectionLabel icon="◇" label="Future Products" color="#f59e0b" /><ListItems items={ins.expected_future_products_services} color="#f59e0b" /></Card>}
              </div>
            )}

            {/* Risk + Catalysts side by side */}
            <div style={{ display: "grid", gridTemplateColumns: ins?.risk_factors?.length > 0 ? "1fr 1fr" : "1fr", gap: 10, marginBottom: 18 }}>
              {/* Risk Factors */}
              {ins?.risk_factors?.length > 0 && (
                <Card accent="#ef4444">
                  <SectionLabel icon="⚠" label="Risk Factors" color="#ef4444" />
                  <ListItems items={ins.risk_factors} color="#ef4444" />
                </Card>
              )}

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

            {/* Peer Analysis */}
            {pa?.peers?.length > 0 && (() => {
              const divergences = pa.peers.filter(p => p.divergence_flag).length;
              const sentimentColors = { BULLISH: "#10b981", NEUTRAL: "#f59e0b", BEARISH: "#f43f5e" };
              const peerColor = (peer) => peer.divergence_flag ? "#f43f5e" : (sentimentColors[peer.sentiment] || "#64748b");
              return (
                <div style={{ marginBottom: 18 }}>
                  {/* Header */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontFamily: "var(--mono)", fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", color: "var(--cyan)" }}>⬡ INDUSTRY PEER ANALYSIS</span>
                      <span style={{ fontFamily: "var(--mono)", fontSize: 9, padding: "2px 6px", borderRadius: 2, background: "rgba(34,211,238,.1)", color: "var(--cyan)", border: "1px solid rgba(34,211,238,.2)" }}>PEER ANALYSIS AGENT</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)" }}>{pa.peers.length} peer{pa.peers.length !== 1 ? "s" : ""} · {q?.quarters_covered?.slice(-1)[0] || ""}</span>
                      {divergences > 0 && (
                        <span style={{ fontFamily: "var(--mono)", fontSize: 10, padding: "2px 8px", borderRadius: 3, background: "rgba(245,158,11,.08)", color: "var(--amber)", border: "1px solid rgba(245,158,11,.2)" }}>⚠ {divergences} DIVERGENCE{divergences > 1 ? "S" : ""}</span>
                      )}
                    </div>
                  </div>

                  {/* Peer Cards */}
                  <div style={{ display: "grid", gridTemplateColumns: pa.peers.length === 1 ? "1fr" : "1fr 1fr", gap: 10, marginBottom: 10 }}>
                    {pa.peers.map((peer, i) => {
                      const col = peerColor(peer);
                      const sentCol = sentimentColors[peer.sentiment] || "#64748b";
                      return (
                        <div key={i} style={{ background: "var(--card)", border: `1px solid ${peer.divergence_flag ? "rgba(244,63,94,.25)" : "var(--line)"}`, borderTop: `2px solid ${col}`, borderRadius: 6, padding: 16 }}>
                          {/* Card Header */}
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <span style={{ fontFamily: "var(--mono)", fontSize: 20, fontWeight: 600, color: "var(--fg)" }}>{peer.ticker}</span>
                              <div>
                                {peer.stock_info?.industry && <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--body)", marginBottom: 3 }}>{peer.stock_info.industry}</div>}
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  <span style={{ fontFamily: "var(--mono)", fontSize: 9, fontWeight: 600, padding: "2px 7px", borderRadius: 2, background: `${sentCol}1a`, color: sentCol, border: `1px solid ${sentCol}33` }}>{peer.sentiment}</span>
                                  {peer.stock_info?.moat && <span style={{ fontFamily: "var(--mono)", fontSize: 9, padding: "2px 7px", borderRadius: 2, background: `${COLORS.moat[peer.stock_info.moat] || "#64748b"}18`, color: COLORS.moat[peer.stock_info.moat] || "#64748b", border: `1px solid ${COLORS.moat[peer.stock_info.moat] || "#64748b"}33` }}>Moat: {peer.stock_info.moat}</span>}
                                  {peer.divergence_flag && <span style={{ fontFamily: "var(--mono)", fontSize: 9, padding: "2px 7px", borderRadius: 2, background: "rgba(244,63,94,.08)", color: "var(--red)", border: "1px solid rgba(244,63,94,.15)" }}>⚑ DIVERGENCE</span>}
                                </div>
                              </div>
                            </div>
                            {peer.revenue_growth && peer.revenue_growth !== "Not disclosed" && (
                              <div style={{ textAlign: "right" }}>
                                <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>REV GROWTH</div>
                                <div style={{ fontFamily: "var(--mono)", fontSize: 16, fontWeight: 600, color: col }}>{peer.revenue_growth}</div>
                              </div>
                            )}
                          </div>

                          {/* Key Signal */}
                          {peer.key_signal && peer.key_signal !== "Not disclosed" && (
                            <div style={{ marginBottom: 10 }}>
                              <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.1em", color: "var(--muted)", marginBottom: 5 }}>KEY SIGNAL</div>
                              <div style={{ fontSize: 13.5, color: "var(--fg)", lineHeight: 1.55, padding: "8px 10px", background: "var(--card2)", borderRadius: 4, borderLeft: `2px solid ${col}`, fontFamily: "var(--body)" }}>{peer.key_signal}</div>
                            </div>
                          )}

                          {/* Demand Language */}
                          {peer.demand_language && peer.demand_language !== "Not disclosed" && (
                            <div style={{ marginBottom: 10 }}>
                              <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.1em", color: "var(--muted)", marginBottom: 5 }}>DEMAND LANGUAGE</div>
                              <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.55, fontStyle: "italic", padding: "6px 10px", borderLeft: "2px solid var(--line)", fontFamily: "var(--body)" }}>"{peer.demand_language}"</div>
                            </div>
                          )}

                          {/* Headwinds */}
                          {peer.headwinds?.length > 0 && (
                            <div>
                              <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.1em", color: "var(--muted)", marginBottom: 5 }}>HEADWINDS</div>
                              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                {peer.headwinds.map((h, j) => (
                                  <div key={j} style={{ display: "flex", gap: 7, fontSize: 13.5, color: "var(--fg)", lineHeight: 1.55, fontFamily: "var(--body)" }}>
                                    <span style={{ color: col, marginTop: 1 }}>▸</span><span>{h}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Synthesis */}
                  {pa.synthesis && (
                    <div style={{ background: "rgba(245,158,11,.04)", border: "1px solid rgba(245,158,11,.2)", borderRadius: 6, padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                        <span style={{ color: "var(--amber)", fontSize: 14, marginTop: 1, flexShrink: 0 }}>⚠</span>
                        <div>
                          <div style={{ fontFamily: "var(--mono)", fontSize: 9, fontWeight: 600, letterSpacing: "0.1em", color: "var(--amber)", marginBottom: 6 }}>PEER SYNTHESIS</div>
                          <div style={{ fontSize: 13, color: "var(--fg)", lineHeight: 1.65, fontFamily: "var(--body)" }}>{pa.synthesis}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Comparative Verdict */}
            {cv && (
              <div style={{ marginBottom: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", color: "#a855f7" }}>◈ COMPARATIVE VERDICT</span>
                  {cv.signal_strength && (
                    <span style={{ fontFamily: "var(--mono)", fontSize: 9, padding: "2px 8px", borderRadius: 2, background: "rgba(168,85,247,.1)", color: "#a855f7", border: "1px solid rgba(168,85,247,.2)" }}>SIGNAL: {cv.signal_strength.toUpperCase()}</span>
                  )}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  {cv.shared_industry_tailwinds?.length > 0 && (
                    <Card accent="#10b981">
                      <SectionLabel icon="↑" label="Industry Tailwinds" color="#10b981" />
                      <ListItems items={cv.shared_industry_tailwinds} color="#10b981" />
                    </Card>
                  )}
                  {cv.shared_industry_headwinds?.length > 0 && (
                    <Card accent="#ef4444">
                      <SectionLabel icon="↓" label="Industry Headwinds" color="#ef4444" />
                      <ListItems items={cv.shared_industry_headwinds} color="#ef4444" />
                    </Card>
                  )}
                  {cv.subject_differentiators?.length > 0 && (
                    <Card accent="#a855f7">
                      <SectionLabel icon="★" label={`${si?.ticker} Differentiators`} color="#a855f7" />
                      <ListItems items={cv.subject_differentiators} color="#a855f7" />
                    </Card>
                  )}
                </div>
                {cv.subject_vs_peers_sentiment && (
                  <div style={{ marginTop: 10, padding: "10px 14px", background: "rgba(168,85,247,.04)", border: "1px solid rgba(168,85,247,.18)", borderRadius: 5 }}>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "#a855f7", fontWeight: 600, letterSpacing: "0.1em", marginRight: 8 }}>VERDICT</span>
                    <span style={{ fontSize: 13, color: "var(--fg)", fontFamily: "var(--body)" }}>{cv.subject_vs_peers_sentiment}</span>
                  </div>
                )}
              </div>
            )}

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
