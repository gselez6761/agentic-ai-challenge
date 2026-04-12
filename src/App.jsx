import { useState, useEffect, useRef } from "react";


/* ── Bold key_drivers phrases inside a text string ── */
function highlightDrivers(text, drivers) {
  if (!drivers?.length) return text;
  const escaped = drivers.map(d => d.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const regex = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part)
      ? <strong key={i} style={{ color: "var(--fg)", fontWeight: 600 }}>{part}</strong>
      : part
  );
}

/* ── Shared section scaffold ── */
function Section({ title, badge, badgeColor = "#6ba3ef", children, delay = 0 }) {
  return (
    <div style={{ marginBottom: 48, animation: `fadeUp 0.6s ease ${delay}s both` }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 14, marginBottom: 20,
        paddingBottom: 12, borderBottom: "1px solid var(--line-dim)",
      }}>
        <span style={{ fontFamily: "var(--display)", fontSize: 22, fontWeight: 600, color: "var(--fg)", letterSpacing: "-0.3px" }}>{title}</span>
        {badge && (
          <span style={{
            fontFamily: "var(--mono)", fontSize: 9, padding: "3px 10px", borderRadius: 3,
            textTransform: "uppercase", letterSpacing: "1.2px", marginLeft: "auto",
            background: badgeColor + "14", color: badgeColor, border: `1px solid ${badgeColor}26`,
          }}>{badge}</span>
        )}
      </div>
      {children}
    </div>
  );
}

/* ── Metric card (executive summary grid) ── */
function MetricCard({ label, value, yoy_change }) {
  const isPos = yoy_change?.startsWith("+");
  const isNeg = yoy_change?.startsWith("-");
  const col = isPos ? "var(--green)" : isNeg ? "var(--red)" : "var(--muted)";
  const arrow = isPos ? "▲" : isNeg ? "▼" : "";
  const display = yoy_change?.replace(/^[+-]/, "") ?? "";
  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--line-dim)", borderRadius: 6, padding: 16, transition: "border-color 0.25s" }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: "var(--mono)", fontSize: 22, fontWeight: 600, color: "var(--fg)", lineHeight: 1.1 }}>{value}</div>
      {yoy_change && (
        <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: col, marginTop: 6 }}>
          {arrow} {display} YoY
        </div>
      )}
    </div>
  );
}

/* ── Content card ── */
function Card({ label, children, accent, style: s }) {
  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--line-dim)", borderRadius: 6, padding: 20, borderLeft: accent ? `3px solid ${accent}` : undefined, transition: "border-color 0.25s", ...s }}>
      {label && <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 10 }}>{label}</div>}
      {children}
    </div>
  );
}

/* ── Signal item (key insights) ── */
function SignalItem({ signal, title, detail }) {
  const map = {
    bullish: { bg: "#2dd4a014", color: "#2dd4a0", border: "#2dd4a026", icon: "↑" },
    bearish: { bg: "#ef6b6b14", color: "#ef6b6b", border: "#ef6b6b26", icon: "↓" },
    neutral: { bg: "#6ba3ef14", color: "#6ba3ef", border: "#6ba3ef26", icon: "→" },
  };
  const m = map[signal] || map.neutral;
  return (
    <div style={{ display: "flex", gap: 14, padding: "16px 20px", background: "var(--card)", border: "1px solid var(--line-dim)", borderRadius: 6, marginBottom: 8, alignItems: "flex-start", transition: "border-color 0.25s" }}>
      <div style={{ width: 30, height: 30, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", background: m.bg, color: m.color, border: `1px solid ${m.border}`, fontFamily: "var(--mono)", fontSize: 14, flexShrink: 0, marginTop: 1 }}>{m.icon}</div>
      <div>
        <div style={{ fontFamily: "var(--body)", fontSize: 13, fontWeight: 600, color: "var(--fg)", marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.75, fontFamily: "var(--body)" }}>{detail}</div>
      </div>
    </div>
  );
}

/* ── Delta item (quarter-over-quarter changes) ── */
function DeltaItem({ type, title, detail }) {
  const map = {
    new:           { icon: "+", bg: "#2dd4a014", color: "#2dd4a0", label: "New This Quarter" },
    tone_shift:    { icon: "Δ", bg: "#efbf6b14", color: "#efbf6b", label: "Tone Shift" },
    metric_change: { icon: "Δ", bg: "#efbf6b14", color: "#efbf6b", label: "Metric Change" },
    dropped:       { icon: "−", bg: "#ef6b6b14", color: "#ef6b6b", label: "Dropped Topic" },
    unchanged:     { icon: "═", bg: "#6ba3ef14", color: "#6ba3ef", label: "Unchanged" },
  };
  const m = map[type] || map.unchanged;
  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--line-dim)", borderRadius: 6, padding: 18, transition: "border-color 0.25s" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 11, width: 22, height: 22, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: m.bg, color: m.color }}>{m.icon}</div>
        <span style={{ fontFamily: "var(--mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "1.2px", color: "var(--muted)" }}>{m.label}</span>
      </div>
      <div style={{ fontFamily: "var(--body)", fontSize: 13, fontWeight: 600, color: "var(--fg)", marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.7, fontFamily: "var(--body)" }}>{detail}</div>
    </div>
  );
}

/* ── Trend card (industry themes) ── */
function TrendCard({ category, title, detail, mentioned_by }) {
  const catLabel = { dominant: "Dominant Theme", emerging: "Emerging Theme", persistent: "Persistent Theme" }[category] ?? category;
  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--line-dim)", borderRadius: 6, padding: 18, transition: "border-color 0.25s" }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 8 }}>{catLabel}</div>
      <div style={{ fontFamily: "var(--body)", fontSize: 13, fontWeight: 600, color: "var(--fg)", marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.7, fontFamily: "var(--body)" }}>{detail}</div>
      {mentioned_by?.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
          {mentioned_by.map((t, i) => (
            <span key={i} style={{ fontFamily: "var(--mono)", fontSize: 10, padding: "2px 8px", borderRadius: 3, background: "var(--bg-e)", border: "1px solid var(--line-dim)", color: "var(--muted)" }}>{t}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [ticker, setTicker] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [phase, setPhase] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const ref = useRef(null);
  const sessionId = useRef(crypto.randomUUID());

  useEffect(() => { ref.current?.focus(); }, []);

  useEffect(() => {
    if (!loading) { setElapsed(0); return; }
    const iv = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(iv);
  }, [loading]);

  const run = async () => {
    if (!ticker.trim()) return;
    setLoading(true); setError(null); setData(null);
    const phases = ["Scanning earnings transcripts...", "Pulling stock fundamentals...", "Analyzing peer transcripts...", "Assessing management sentiment...", "Building delta analysis...", "Compiling research report..."];
    let i = 0; setPhase(phases[0]);
    const iv = setInterval(() => { i++; if (i < phases.length) setPhase(phases[i]); }, 3500);
    try {
      const WEBHOOK_URL = "https://codemachine.app.n8n.cloud/webhook/ed36debd-2f06-448c-b98e-ef138d3f692a";
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatInput: ticker.trim().toUpperCase(), sessionId: sessionId.current }),
      });
      let raw = await res.json();
      if (Array.isArray(raw)) raw = raw[0];
      if (raw.output) raw = raw.output;
      if (typeof raw === "string") raw = JSON.parse(raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim());
      clearInterval(iv);
      setData(raw);
    } catch (e) {
      clearInterval(iv); setError(e.message);
    } finally {
      setLoading(false); setPhase("");
    }
  };

const ex = data?.executive_summary;


  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--fg)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        :root {
          --bg: #060608;
          --bg-s: #0c0c10;
          --bg-e: #121218;
          --card: #16161e;
          --card2: #1c1c26;
          --line-dim: #1a1a24;
          --line: #22222e;
          --line-b: #2e2e3c;
          --fg: #e4e2dd;
          --muted: #908e88;
          --ghost: #7a7875;
          --green: #2dd4a0;
          --red: #ef6b6b;
          --blue: #6ba3ef;
          --amber: #efbf6b;
          --mono: 'IBM Plex Mono', monospace;
          --body: 'DM Sans', sans-serif;
          --display: 'Playfair Display', serif;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: var(--bg); }
        body::after {
          content: '';
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 9999;
          opacity: 0.025;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E");
          background-repeat: repeat;
          background-size: 200px 200px;
        }
        input::placeholder { color: var(--ghost); }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--line); border-radius: 2px; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:.4; } 50% { opacity:1; } }
        @keyframes scan { 0% { transform: translateX(-100%); } 100% { transform: translateX(250%); } }
        @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
        .fade { animation: fadeUp .5s ease forwards; }
      `}</style>

      {/* ── Nav ── */}
      <div style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(6,6,8,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--line-dim)" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "10px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 3, flexShrink: 0 }}>
            <span style={{ fontFamily: "var(--display)", fontSize: 26, fontWeight: 700, color: "var(--green)", lineHeight: 1 }}>α</span>
            <span style={{ fontFamily: "var(--display)", fontSize: 20, fontWeight: 400, color: "var(--fg)", letterSpacing: "-0.5px" }}>Research</span>
          </div>

          {/* Search */}
          <div style={{ display: "flex", gap: 8, flex: "0 1 360px" }}>
            <div style={{ flex: 1, display: "flex", alignItems: "center", background: "var(--card)", border: "1px solid var(--line)", borderRadius: 5, padding: "0 12px", height: 38 }}>
              <span style={{ color: "var(--green)", fontFamily: "var(--mono)", fontSize: 13, marginRight: 8 }}>$</span>
              <input
                ref={ref}
                value={ticker}
                onChange={e => setTicker(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === "Enter" && run()}
                placeholder="TICKER"
                style={{ flex: 1, background: "none", border: "none", outline: "none", color: "var(--fg)", fontSize: 16, fontFamily: "var(--mono)", fontWeight: 600, letterSpacing: "3px", width: 0 }}
              />
            </div>
            <button
              onClick={run}
              disabled={loading}
              style={{
                height: 38, padding: "0 18px",
                background: loading ? "var(--line)" : "var(--green)",
                border: "none", borderRadius: 5,
                color: loading ? "var(--muted)" : "#060608",
                fontSize: 13, fontFamily: "var(--mono)", fontWeight: 600,
                letterSpacing: "0.8px", textTransform: "uppercase",
                cursor: loading ? "wait" : "pointer", flexShrink: 0,
              }}
            >{loading ? "..." : "▶ Run"}</button>
          </div>

          {/* Status */}
          <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--fg)", textTransform: "uppercase", letterSpacing: "1.5px", display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--green)", animation: "blink 2.5s infinite", display: "inline-block" }} />
            Agent Online
          </span>
        </div>

        {/* Loading bar */}
        {loading && (
          <div style={{ borderTop: "1px solid var(--line-dim)" }}>
            <div style={{ height: 2, background: "var(--line)", overflow: "hidden", width: "100%" }}>
              <div style={{ height: "100%", width: "40%", background: "linear-gradient(90deg, transparent, var(--green), transparent)", animation: "scan 1.8s ease infinite" }} />
            </div>
          </div>
        )}
      </div>

      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "28px 32px" }}>

        {/* ── Error ── */}
        {error && (
          <div style={{ marginBottom: 20, padding: "10px 14px", background: "#ef6b6b12", border: "1px solid #ef6b6b26", borderRadius: 6, color: "#ef6b6b", fontSize: 11, fontFamily: "var(--mono)" }}>
            ERROR: {error}
          </div>
        )}

        {/* ── Loading State ── */}
        {loading && (
          <div style={{ marginTop: 130, textAlign: "center" }} className="fade">
            <div style={{ fontFamily: "var(--display)", fontSize: 72, color: "var(--ghost)", marginBottom: 24, lineHeight: 1 }}>α</div>
            <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--green)", animation: "pulse 1.5s ease infinite", letterSpacing: "1px" }}>{phase}</span>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ghost)", marginTop: 10, letterSpacing: "1px" }}>
              {String(Math.floor(elapsed / 60)).padStart(2, "0")}:{String(elapsed % 60).padStart(2, "0")}
            </div>
          </div>
        )}

        {/* ── Empty State ── */}
        {!data && !loading && !error && (
          <div style={{ marginTop: 130, textAlign: "center" }} className="fade">
            <div style={{ fontFamily: "var(--display)", fontSize: 72, color: "var(--ghost)", marginBottom: 18, lineHeight: 1 }}>α</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", color: "var(--fg)" }}>
              Enter a ticker to generate an equity research report
            </div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, marginTop: 8, color: "var(--muted)", letterSpacing: "0.5px" }}>
              Earnings Transcripts · Competitor Analysis · Quarter-over-Quarter Delta
            </div>
          </div>
        )}

        {/* ══════════ REPORT ══════════ */}
        {data && (
          <div className="fade">

            {/* Ticker + Quarter header */}
            <div style={{ marginBottom: 36 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 4 }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: 46, fontWeight: 600, color: "var(--fg)", letterSpacing: "-0.02em" }}>{data.ticker}</span>
                {data.quarter && (
                  <span style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--muted)", letterSpacing: "1px" }}>{data.quarter}</span>
                )}
              </div>
            </div>

            {/* ══ 1. Executive Summary ══ */}
            {ex && (
              <Section title="Executive Summary" delay={0.05}>

                {/* Metrics grid */}
                {ex.metrics?.length > 0 && (
                  <div style={{ display: "grid", gridTemplateColumns: `repeat(${ex.metrics.length}, 1fr)`, gap: 10, marginBottom: 16 }}>
                    {ex.metrics.map((m, i) => <MetricCard key={i} {...m} />)}
                  </div>
                )}

                {/* Headline + Guidance 2-col */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <Card label="Headline Takeaway">
                    <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.8, fontFamily: "var(--body)" }}>
                      {highlightDrivers(ex.headline_takeaway, ex.key_drivers)}
                    </p>
                    {ex.primary_driver && (
                      <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.8, fontFamily: "var(--body)", marginTop: 14 }}>
                        <strong style={{ color: "var(--fg)", fontWeight: 600 }}>Key Driver:</strong> {ex.primary_driver}
                      </p>
                    )}
                  </Card>
                  <Card label="Forward Guidance">
                    <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.8, fontFamily: "var(--body)" }}>
                      {ex.forward_guidance}
                    </p>
                  </Card>
                </div>
              </Section>
            )}

            {/* ══ 2. Key Insights ══ */}
            {data.key_insights?.length > 0 && (
              <Section
                title="Key Insights"
                badge={`${data.key_insights.length} Signals Detected`}
                badgeColor="#6ba3ef"
                delay={0.1}
              >
                {data.key_insights.map((item, i) => <SignalItem key={i} {...item} />)}
              </Section>
            )}

            {/* ══ 3. Delta vs Last Quarter ══ */}
            {data.delta_vs_last_quarter?.changes?.length > 0 && (
              <Section
                title="Delta vs. Last Quarter"
                badge={data.delta_vs_last_quarter.comparison}
                badgeColor="#efbf6b"
                delay={0.15}
              >
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {data.delta_vs_last_quarter.changes.map((item, i) => <DeltaItem key={i} {...item} />)}
                </div>
              </Section>
            )}

            {/* ══ 4. Industry & Thematic Trends ══ */}
            {data.industry_trends?.themes?.length > 0 && (
              <Section
                title="Industry & Thematic Trends"
                badge="Cross-Transcript"
                badgeColor="#6ba3ef"
                delay={0.2}
              >
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
                  {data.industry_trends.themes.map((item, i) => <TrendCard key={i} {...item} />)}
                </div>

                {/* Sources bar */}
                {data.industry_trends.sources?.length > 0 && (
                  <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--line-dim)", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ghost)", textTransform: "uppercase", letterSpacing: "1.5px" }}>Sources</span>
                    {data.industry_trends.sources.map((s, i) => (
                      <span key={i} style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", padding: "4px 10px", borderRadius: 3, background: "var(--bg-e)", border: "1px solid var(--line-dim)" }}>{s}</span>
                    ))}
                  </div>
                )}
              </Section>
            )}

          </div>
        )}

      </div>

      {/* ── Footer ── */}
      {data && (
        <div style={{ borderTop: "1px solid var(--line-dim)" }}>
          <div style={{ maxWidth: 1320, margin: "0 auto", padding: "18px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ghost)", letterSpacing: "0.5px" }}>αResearch Terminal — UMD Agentic AI Challenge 2026</span>
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ghost)", letterSpacing: "0.5px" }}>Multi-Agent Architecture · n8n · Claude</span>
          </div>
        </div>
      )}
    </div>
  );
}
