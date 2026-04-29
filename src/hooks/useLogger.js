/**
 * useLogger.js
 * ─────────────────────────────────────────────────────────────────────────
 * Custom hook that manages the backend-monitor log entries.
 *
 * Usage:
 *   const { log, pushLog, clearLog } = useLogger(initialEntries);
 *
 * log    — array of { time, type, text }
 * pushLog(type, text) — appends a new entry (capped at 120 lines)
 * clearLog()          — resets to a single "system reset" entry
 */

import { useState } from "react";
import { timestamp } from "../utils";
import { WORKERS } from "../constants";

const MAX_LOG_LINES = 120;

function makeEntry(type, text) {
  return { time: timestamp(), type, text };
}

export function useLogger() {
  const [log, setLog] = useState([
    makeEntry("system", `Backend ready · workers online: ${WORKERS.join(", ")}`),
  ]);

  function pushLog(type, text) {
    setLog((prev) => [...prev.slice(-MAX_LOG_LINES), makeEntry(type, text)]);
  }

  function clearLog() {
    setLog([makeEntry("system", "System reset · backend ready")]);
  }

  return { log, pushLog, clearLog };
}
