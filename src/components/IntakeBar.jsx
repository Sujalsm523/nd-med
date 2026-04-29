/**
 * IntakeBar.jsx
 * ─────────────────────────────────────────────────────────────────────────
 * A horizontal step-indicator and progress bar shown at the top of the
 * Customer panel while the intake flow is active.
 *
 * Hidden once userState is null or step === "done".
 *
 * Props:
 *   userState — { step, data } | null
 */

import { INTAKE_STEPS, STEP_LABELS } from "../constants";

export default function IntakeBar({ userState }) {
  if (!userState || userState.step === "done") return null;

  const currentIdx   = INTAKE_STEPS.indexOf(userState.step);
  const visibleSteps = INTAKE_STEPS.filter((s) => s !== "done");
  const pctDone      = Math.round((currentIdx / (INTAKE_STEPS.length - 1)) * 100);

  return (
    <>
      {/* ── Progress bar ── */}
      <div style={{ padding: "6px 12px 4px" }}>
        <div
          style={{
            height:       "3px",
            background:   "var(--color-background-secondary)",
            borderRadius: "2px",
            overflow:     "hidden",
          }}
        >
          <div
            style={{
              height:     "100%",
              width:      pctDone + "%",
              background: "#a855f7",
              borderRadius: "2px",
              transition: "width 0.35s ease",
            }}
          />
        </div>
      </div>

      {/* ── Step pills ── */}
      <div
        style={{
          display:        "flex",
          alignItems:     "center",
          gap:            "4px",
          padding:        "4px 12px 6px",
          borderBottom:   "0.5px solid var(--color-border-tertiary)",
          background:     "var(--color-background-secondary)",
          flexWrap:       "wrap",
        }}
      >
        {visibleSteps.map((step, i) => {
          const done    = i < currentIdx;
          const current = i === currentIdx;
          return (
            <span key={step} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span
                style={{
                  fontSize:   "10px",
                  padding:    "2px 8px",
                  borderRadius:"20px",
                  fontFamily: "var(--font-mono)",
                  background: done    ? "var(--color-background-success)"
                            : current ? "#f3e8ff"
                            :            "var(--color-background-secondary)",
                  color:      done    ? "var(--color-text-success)"
                            : current ? "#7c3aed"
                            :            "var(--color-text-tertiary)",
                  border:     current ? "0.5px solid #c084fc"
                            :           "0.5px solid var(--color-border-tertiary)",
                  fontWeight: current ? "500" : "400",
                }}
              >
                {done ? "✓ " + STEP_LABELS[step] : STEP_LABELS[step]}
              </span>
              {i < visibleSteps.length - 1 && (
                <span style={{ color: "var(--color-text-tertiary)", fontSize: "10px" }}>›</span>
              )}
            </span>
          );
        })}

        {/* Percentage label */}
        <span
          style={{
            marginLeft: "auto",
            fontSize:   "10px",
            fontFamily: "var(--font-mono)",
            color:      "#7c3aed",
          }}
        >
          {pctDone}%
        </span>
      </div>
    </>
  );
}
