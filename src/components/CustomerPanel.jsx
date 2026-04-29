/**
 * CustomerPanel.jsx
 * ─────────────────────────────────────────────────────────────────────────
 * Left panel — simulates the customer-facing WhatsApp-style chat UI.
 *
 * During intake  → shows intake steps, progress bar, collected-data card,
 *                  and bot prompts in the chat area.
 * After intake   → switches to normal order chat (customer ↔ worker).
 *
 * Props:
 *   messages     — array of message objects for the active thread
 *   userState    — { step, data } | null
 *   orderId      — string | null (null while intake is active)
 *   order        — order object | null
 *   input        — controlled input value
 *   onInputChange— (val) => void
 *   onSend       — () => void
 *   onReset      — () => void
 */

import { useRef, useEffect } from "react";
import Avatar       from "./Avatar";
import Bubble       from "./Bubble";
import IntakeBar    from "./IntakeBar";
import UserDataCard from "./UserDataCard";
import { CUSTOMER_PHONE, STEP_LABELS } from "../constants";

// ─── Panel-level shared styles ─────────────────────────────────────────────
const S = {
  panel: {
    display:       "flex",
    flexDirection: "column",
    border:        "0.5px solid var(--color-border-tertiary)",
    borderRadius:  "var(--border-radius-lg)",
    overflow:      "hidden",
  },
  head: {
    padding:       "10px 14px",
    borderBottom:  "0.5px solid var(--color-border-tertiary)",
    background:    "var(--color-background-secondary)",
    display:       "flex",
    alignItems:    "center",
    gap:           "9px",
  },
  chatArea: {
    overflowY:     "auto",
    padding:       "12px",
    display:       "flex",
    flexDirection: "column",
    gap:           "6px",
    background:    "var(--color-background-primary)",
    minHeight:     "280px",
    maxHeight:     "320px",
  },
  inputRow: {
    padding:       "8px 10px",
    borderTop:     "0.5px solid var(--color-border-tertiary)",
    background:    "var(--color-background-secondary)",
    display:       "flex",
    gap:           "6px",
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

export default function CustomerPanel({
  messages,
  userState,
  orderId,
  order,
  input,
  onInputChange,
  onSend,
  onReset,
}) {
  const chatRef   = useRef(null);
  const isIntake  = !orderId;

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, userState]);

  // Subtitle in header
  const subtitle = isIntake
    ? userState
      ? `Intake: ${STEP_LABELS[userState.step]}`
      : "Send a message to begin"
    : orderId;

  return (
    <div style={S.panel}>
      {/* ── Header ── */}
      <div style={S.head}>
        <Avatar
          initials="S"
          bg="var(--color-background-success)"
          color="var(--color-text-success)"
          size={34}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: "500", fontSize: "13px" }}>XYZ Medical</div>
          <div
            style={{
              fontSize:     "11px",
              color:        "var(--color-text-tertiary)",
              overflow:     "hidden",
              textOverflow: "ellipsis",
              whiteSpace:   "nowrap",
            }}
          >
            {subtitle}
          </div>
        </div>
        {orderId && (
          <button
            onClick={onReset}
            style={{ fontSize: "11px", padding: "3px 8px", color: "var(--color-text-tertiary)" }}
          >
            Reset
          </button>
        )}
      </div>

      {/* ── Intake progress (only while intake is active) ── */}
      {isIntake && <IntakeBar userState={userState} />}
      {isIntake && userState && <UserDataCard data={userState.data} />}

      {/* ── Chat area ── */}
      <div ref={chatRef} style={S.chatArea}>
        {messages.length === 0 && (
          <div
            style={{
              textAlign:  "center",
              color:      "var(--color-text-tertiary)",
              fontSize:   "12px",
              marginTop:  "60px",
              lineHeight: "1.6",
            }}
          >
            {isIntake
              ? "Send a message to begin intake.\nWe'll collect a few details before creating your order."
              : "No messages yet."}
          </div>
        )}

        {messages.map((msg) => (
          <Bubble
            key={msg.id}
            msg={msg}
            isRight={msg.from === "customer"}
            sub={
              msg.from === "worker" ? `Pharmacist · ${order?.worker}` :
              msg.from === "bot"    ? "XYZ Medical"                   :
              null
            }
          />
        ))}
      </div>

      {/* ── Input row ── */}
      <div style={S.inputRow}>
        <input
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSend()}
          placeholder={isIntake ? "Type your reply…" : "Message your pharmacist…"}
          style={{ flex: 1, fontSize: "13px" }}
        />
        <button onClick={onSend} style={{ padding: "5px 12px", fontSize: "12px" }}>
          Send
        </button>
      </div>

      {/* ── Footer ── */}
      <div style={S.foot}>customer · {CUSTOMER_PHONE}</div>
    </div>
  );
}
