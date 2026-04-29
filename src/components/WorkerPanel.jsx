/**
 * WorkerPanel.jsx
 * ─────────────────────────────────────────────────────────────────────────
 * Right panel — the internal worker/pharmacist dashboard.
 * Shows patient intake data at the top, order-selection tabs, and the
 * conversation thread for the selected order.
 *
 * Props:
 *   orderList    — OrderObject[]
 *   messages     — { [orderId]: MessageObject[] }
 *   selectedId   — string | null
 *   onSelectOrder— (id) => void
 *   input        — string
 *   onInputChange— (val) => void
 *   onSend       — () => void
 */

import { useRef, useEffect } from "react";
import Avatar  from "./Avatar";
import Bubble  from "./Bubble";
import { CUSTOMER_PHONE } from "../constants";

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
    padding:    "8px 10px",
    borderTop:  "0.5px solid var(--color-border-tertiary)",
    background: "var(--color-background-secondary)",
    display:    "flex",
    gap:        "6px",
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

const PATIENT_FIELDS = [
  ["patientName",  "Name"],
  ["patientAge",   "Age"],
  ["patientSex",   "Sex"],
  ["address",      "Address"],
  ["prescription", "Rx"],
];

function PatientDataCard({ order }) {
  if (!order) return null;
  const populated = PATIENT_FIELDS.filter(([key]) => order[key]);
  if (populated.length === 0) return null;

  return (
    <div
      style={{
        padding:      "7px 12px",
        borderBottom: "0.5px solid var(--color-border-tertiary)",
        background:   "var(--color-background-secondary)",
      }}
    >
      <div
        style={{
          fontSize:      "10px",
          fontWeight:    "500",
          color:         "var(--color-text-tertiary)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom:  "4px",
          fontFamily:    "var(--font-mono)",
        }}
      >
        Patient intake
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "1px 8px", fontSize: "11px" }}>
        {populated.map(([key, label]) => (
          <>
            <span key={key + "_l"} style={{ color: "var(--color-text-tertiary)", padding: "1px 0" }}>
              {label}
            </span>
            <span
              key={key + "_v"}
              style={{
                fontFamily:   "var(--font-mono)",
                color:        "var(--color-text-primary)",
                overflow:     "hidden",
                textOverflow: "ellipsis",
                whiteSpace:   "nowrap",
                padding:      "1px 0",
              }}
            >
              {order[key]}
            </span>
          </>
        ))}
      </div>
    </div>
  );
}

export default function WorkerPanel({
  orderList,
  messages,
  selectedId,
  onSelectOrder,
  input,
  onInputChange,
  onSend,
}) {
  const chatRef      = useRef(null);
  const selectedOrder = selectedId ? orderList.find((o) => o.id === selectedId) : null;
  const threadMsgs   = selectedId ? (messages[selectedId] || []) : [];

  // Auto-scroll chat
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [threadMsgs, selectedId]);

  return (
    <div style={S.panel}>
      {/* ── Header ── */}
      <div style={S.head}>
        <Avatar
          initials={selectedOrder ? selectedOrder.worker[0] : "W"}
          bg="var(--color-background-info)"
          color="var(--color-text-info)"
          size={34}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: "500", fontSize: "13px" }}>
            {selectedOrder ? selectedOrder.worker : "Worker Panel"}
          </div>
          <div
            style={{
              fontSize:     "11px",
              color:        "var(--color-text-tertiary)",
              overflow:     "hidden",
              textOverflow: "ellipsis",
              whiteSpace:   "nowrap",
            }}
          >
            {selectedOrder ? `assigned: ${selectedOrder.id}` : "awaiting assignment"}
          </div>
        </div>
      </div>

      {/* ── Patient intake data card ── */}
      <PatientDataCard order={selectedOrder} />

      {/* ── Order-selection tabs ── */}
      {orderList.length > 0 && (
        <div
          style={{
            display:      "flex",
            gap:          "4px",
            padding:      "6px 10px",
            flexWrap:     "wrap",
            borderBottom: "0.5px solid var(--color-border-tertiary)",
            background:   "var(--color-background-secondary)",
          }}
        >
          {orderList.map((order) => (
            <button
              key={order.id}
              onClick={() => onSelectOrder(order.id)}
              style={{
                padding:    "3px 9px",
                fontSize:   "10px",
                fontFamily: "var(--font-mono)",
                background: selectedId === order.id ? "var(--color-background-info)" : "transparent",
                color:      selectedId === order.id ? "var(--color-text-info)" : "var(--color-text-secondary)",
                border:     `0.5px solid ${selectedId === order.id ? "var(--color-border-info)" : "var(--color-border-secondary)"}`,
              }}
            >
              {order.id}
            </button>
          ))}
        </div>
      )}

      {/* ── Chat area ── */}
      <div ref={chatRef} style={S.chatArea}>
        {!selectedId ? (
          <div style={{ textAlign: "center", color: "var(--color-text-tertiary)", fontSize: "12px", marginTop: "70px" }}>
            Waiting for order assignment
          </div>
        ) : threadMsgs.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--color-text-tertiary)", fontSize: "12px", marginTop: "70px" }}>
            No messages yet for {selectedId}
          </div>
        ) : (
          threadMsgs.map((msg) => (
            <Bubble
              key={msg.id}
              msg={msg}
              isRight={msg.from === "worker"}
              sub={
                msg.from === "customer" || msg.from === "bot"
                  ? `Customer · ${CUSTOMER_PHONE}`
                  : null
              }
            />
          ))
        )}
      </div>

      {/* ── Input row ── */}
      <div style={S.inputRow}>
        <input
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSend()}
          placeholder={selectedId ? "Reply to customer…" : "Select an order first"}
          disabled={!selectedId}
          style={{ flex: 1, fontSize: "13px" }}
        />
        <button
          onClick={onSend}
          disabled={!selectedId}
          style={{ padding: "5px 12px", fontSize: "12px" }}
        >
          Reply
        </button>
      </div>

      {/* ── Footer ── */}
      <div style={S.foot}>worker · internal panel</div>
    </div>
  );
}
