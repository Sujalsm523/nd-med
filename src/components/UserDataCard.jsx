/**
 * UserDataCard.jsx
 * ─────────────────────────────────────────────────────────────────────────
 * Compact card shown below IntakeBar while intake is active.
 * Displays the data collected so far (fields appear progressively).
 *
 * Props:
 *   data — { name, age, sex, address, prescription }
 */

const FIELDS = [
  ["name",         "Name"],
  ["age",          "Age"],
  ["sex",          "Gender"],
  ["address",      "Address"],
  ["prescription", "Rx"],
];

export default function UserDataCard({ data }) {
  if (!data) return null;

  const populatedFields = FIELDS.filter(([key]) => data[key]);
  if (populatedFields.length === 0) return null;

  return (
    <div
      style={{
        margin:       "4px 12px 6px",
        padding:      "8px 10px",
        background:   "var(--color-background-secondary)",
        borderRadius: "var(--border-radius-md)",
        border:       "0.5px solid #c084fc33",
      }}
    >
      <div
        style={{
          fontSize:     "10px",
          fontFamily:   "var(--font-mono)",
          color:        "#7c3aed",
          marginBottom: "5px",
          fontWeight:   "500",
        }}
      >
        Collected intake data
      </div>

      <div
        style={{
          display:             "grid",
          gridTemplateColumns: "auto 1fr",
          gap:                 "2px 10px",
        }}
      >
        {populatedFields.map(([key, label]) => (
          <>
            <span
              key={key + "_label"}
              style={{ fontSize: "11px", color: "var(--color-text-tertiary)" }}
            >
              {label}
            </span>
            <span
              key={key + "_value"}
              style={{
                fontSize:     "11px",
                fontFamily:   "var(--font-mono)",
                color:        "var(--color-text-primary)",
                overflow:     "hidden",
                textOverflow: "ellipsis",
                whiteSpace:   "nowrap",
              }}
            >
              {data[key]}
            </span>
          </>
        ))}
      </div>
    </div>
  );
}
