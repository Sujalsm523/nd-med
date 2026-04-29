/**
 * Avatar.jsx
 * Circular initials avatar used in panel headers.
 */

export default function Avatar({ initials, bg, color, size = 32 }) {
  return (
    <div
      style={{
        width:          size,
        height:         size,
        borderRadius:   "50%",
        flexShrink:     0,
        background:     bg,
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        fontSize:       Math.round(size * 0.4),
        fontWeight:     "500",
        color,
      }}
    >
      {initials}
    </div>
  );
}
