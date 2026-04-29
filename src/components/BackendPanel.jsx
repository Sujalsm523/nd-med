/**
 * BackendPanel.jsx
 * ─────────────────────────────────────────────────────────────────────────
 * Centre panel — the Backend Monitor.
 * Shows the in-memory user_state and orders dictionary, plus a scrollable
 * real-time log of all API events.
 *
 * Props:
 *   userState  — { step, data } | null
 *   orderList  — OrderObject[]
 *   messages   — { [id]: MessageObject[] }
 *   log        — LogEntry[]
 *   workers    — string[]
 */

import { useRef, useEffect } from "react";
import { CUSTOMER_PHONE, LOG_COLORS, WORKERS } from "../constants";

const S = {
  panel: {
    display:       "flex",
    flexDirection: "column",
    border:        "0.5px solid var(--color-border-tertiary)",
    borderRadius:  "var(--border-radius-lg)",
    overflow:      "hidden",
  },
  head: {
    padding:      "10px 14px",
    borderBottom: "0.5px solid var(--color-border-tertiary)",
    background:   "var(--color-background-secondary)",
    display:      "flex",
    alignItems:   "center",
    gap:          "9px",
  },
  sectionLabel: {
    fontSize:      "10px",
    fontWeight:    "500",
    color:         "var(--color-text-tertiary)",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom:  "6px",
    fontFamily:    "var(--font-mono)",
  },
  foot: {
    textAlign:  "center",
    padding:    "5px 8px",
    fontSize:   "10px",
    color:      "var(--color-text-tertiary)",
    background: "var(--color-background-secondary)",
    borderTop:  "0.5px solid var(--color-border-tertiary)",
    fontFamily: "var(--font-mono)",
  },
};

function OrderRow({ order, msgCount }) {
  return (
    <div
      style={{
        display:      "flex",
        alignItems:   "center",
        gap:          "6px",
        padding:      "5px 8px",
        marginBottom: "4px",
        borderRadius: "var(--border-radius-md)",
        background:   "var(--color-background-primary)",
        border:       "0.5px solid var(--color-border-tertiary)",
      }}
    >
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: "500" }}>
        {order.id}
      </span>
      <span style={{ fontSize: "11px", color: "var(--color-text-secondary)", flex: 1, textAlign: "right" }}>
        → {order.worker}
      </span>
      <span
        style={{
          fontSize:     "10px",
          fontFamily:   "var(--font-mono)",
          background:   "var(--color-background-info)",
          color:        "var(--color-text-info)",
          padding:      "1px 7px",
          borderRadius: "var(--border-radius-md)",
        }}
      >
        {msgCount} msg{msgCount !== 1 ? "s" : ""}
      </span>
      <span
        style={{
          fontSize:     "10px",
          fontFamily:   "var(--font-mono)",
          background:   "var(--color-background-success)",
          color:        "var(--color-text-success)",
          padding:      "1px 7px",
          borderRadius: "var(--border-radius-md)",
        }}
      >
        {order.status}
      </span>
    </div>
  );
}

function LogEntry({ entry }) {
  return (
    <div
      style={{
        fontFamily: "var(--font-mono)",
        fontSize:   "10.5px",
        lineHeight: "1.55",
        color:      LOG_COLORS[entry.type] || "var(--color-text-secondary)",
        wordBreak:  "break-all",
      }}
    >
      <span style={{ opacity: 0.4 }}>{entry.time} </span>
      <span style={{ opacity: 0.6 }}>[{entry.type.toUpperCase()}] </span>
      {entry.text}
    </div>
  );
}

export default function BackendPanel({ userState, orderList, messages, log }) {
  const logRef = useRef(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  return (
    <div style={S.panel}>
      {/* ── Header ── */}
      <div style={S.head}>
        <div
          style={{
            width:        8,
            height:       8,
            borderRadius: "50%",
            background:   "var(--color-background-success)",
            flexShrink:   0,
          }}
        />
        <span style={{ fontFamily: "var(--font-mono)", fontWeight: "500", fontSize: "13px" }}>
          Backend Monitor
        </span>
        <span
          style={{
            marginLeft: "auto",
            fontFamily: "var(--font-mono)",
            fontSize:   "10px",
            color:      "var(--color-text-tertiary)",
          }}
        >
          FastAPI · in-memory
        </span>
      </div>

      {/* ── State / Orders dictionary ── */}
      <div
        style={{
          padding:      "8px 12px 10px",
          borderBottom: "0.5px solid var(--color-border-tertiary)",
          background:   "var(--color-background-secondary)",
        }}
      >
        <div style={S.sectionLabel}>user_state[ ] / orders[ ]</div>

        {/* Live user_state row while intake is active */}
        {userState && userState.step !== "done" && (
          <div
            style={{
              marginBottom: "6px",
              padding:      "5px 8px",
              borderRadius: "var(--border-radius-md)",
              background:   "var(--color-background-primary)",
              border:       "0.5px solid #c084fc44",
              display:      "flex",
              alignItems:   "center",
              gap:          "6px",
            }}
          >
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "#7c3aed", fontWeight: "500" }}>
              phone:
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--color-text-secondary)" }}>
              {CUSTOMER_PHONE}
            </span>
            <span
              style={{
                marginLeft:   "auto",
                fontSize:     "10px",
                fontFamily:   "var(--font-mono)",
                background:   "#f3e8ff",
                color:        "#7c3aed",
                padding:      "1px 7px",
                borderRadius: "var(--border-radius-md)",
              }}
            >
              step: {userState.step}
            </span>
          </div>
        )}

        {/* Order rows */}
        {orderList.length === 0 && !(userState && userState.step !== "done") && (
          <div style={{ fontSize: "12px", color: "var(--color-text-tertiary)", fontFamily: "var(--font-mono)" }}>
            {"{ }"}
          </div>
        )}
        {orderList.map((order) => (
          <OrderRow
            key={order.id}
            order={order}
            msgCount={messages[order.id]?.length || 0}
          />
        ))}
      </div>

      {/* ── Log ── */}
      <div
        ref={logRef}
        style={{
          flex:          1,
          overflowY:     "auto",
          padding:       "8px 12px",
          display:       "flex",
          flexDirection: "column",
          gap:           "2px",
          maxHeight:     "280px",
        }}
      >
        {log.map((entry, i) => (
          <LogEntry key={i} entry={entry} />
        ))}
      </div>

      {/* ── Footer ── */}
      <div style={S.foot}>
        assignment: round-robin · {WORKERS.join(" · ")}
      </div>
    </div>
  );
}
