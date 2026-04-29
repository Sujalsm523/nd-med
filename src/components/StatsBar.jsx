/**
 * StatsBar.jsx
 * ─────────────────────────────────────────────────────────────────────────
 * Four metric cards at the top of the app.
 *
 * Props:
 *   orderCount   — number
 *   messageCount — number
 *   workerCount  — number
 *   intakeStep   — string | null  (current step label while intake is active)
 */

export default function StatsBar({ orderCount, messageCount, workerCount, intakeStep }) {
  const stats = [
    { label: "total orders",   value: orderCount,   mono: true  },
    { label: "total messages", value: messageCount, mono: true  },
    { label: "workers online", value: workerCount,  mono: true  },
    { label: "intake step",    value: intakeStep || "—", mono: false },
  ];

  return (
    <div
      style={{
        display:             "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap:                 "8px",
      }}
    >
      {stats.map((stat) => (
        <div
          key={stat.label}
          style={{
            background:   "var(--color-background-secondary)",
            borderRadius: "var(--border-radius-md)",
            padding:      "8px 12px",
            border:       "0.5px solid var(--color-border-tertiary)",
          }}
        >
          <div
            style={{
              fontSize:      "10px",
              color:         "var(--color-text-tertiary)",
              marginBottom:  "2px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {stat.label}
          </div>
          <div
            style={{
              fontSize:   "20px",
              fontWeight: "500",
              fontFamily: stat.mono ? "var(--font-mono)" : "var(--font-sans)",
            }}
          >
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
}
