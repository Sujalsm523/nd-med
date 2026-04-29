/**
 * Bubble.jsx
 * A single chat message bubble.
 *
 * Props:
 *   msg      — { from, text, time }
 *   isRight  — true  → green bubble aligned right  (customer / worker "sent")
 *            — false → grey or purple bubble on left (incoming / bot)
 *   sub      — optional sub-label shown above the message text (e.g. sender name)
 */

export default function Bubble({ msg, isRight, sub }) {
  const isBot = msg.from === "bot";

  const bg    = isRight  ? "var(--color-background-success)"
              : isBot    ? "#f3e8ff"
              :             "var(--color-background-secondary)";

  const color = isRight  ? "var(--color-text-success)"
              : isBot    ? "#581c87"
              :             "var(--color-text-primary)";

  return (
    <div style={{ display: "flex", justifyContent: isRight ? "flex-end" : "flex-start" }}>
      <div
        style={{
          maxWidth:     "78%",
          padding:      "7px 11px",
          borderRadius: isRight ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
          background:   bg,
          fontSize:     "13px",
          lineHeight:   "1.45",
        }}
      >
        {/* Optional sender label */}
        {sub && (
          <div
            style={{
              fontSize:     "10px",
              fontWeight:   "500",
              color:        "var(--color-text-secondary)",
              marginBottom: "3px",
            }}
          >
            {sub}
          </div>
        )}

        {/* Message body (preserves newlines from bot prompts) */}
        <div style={{ color, whiteSpace: "pre-wrap" }}>{msg.text}</div>

        {/* Timestamp */}
        <div
          style={{
            fontSize:   "10px",
            color:      "var(--color-text-tertiary)",
            textAlign:  "right",
            marginTop:  "3px",
          }}
        >
          {msg.time}
        </div>
      </div>
    </div>
  );
}
