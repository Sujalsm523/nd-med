/**
 * App.jsx
 * ─────────────────────────────────────────────────────────────────────────
 * Root component.  Owns the three top-level concerns:
 *   1. Intake state machine  (userState + stateMachine.js)
 *   2. Orders + messages     (useOrders hook)
 *   3. Backend log           (useLogger hook)
 *
 * All heavy logic lives in the hooks and stateMachine; this file is
 * responsible only for wiring them together and rendering the layout.
 */

import { useState } from "react";

import {
  WORKERS,
  CUSTOMER_PHONE,
  STEP_LABELS,
  INTAKE_THREAD_KEY,
} from "../constants";
import {
  makeCustomerMessage,
  makeBotMessage,
  makeWorkerMessage,
  truncate,
} from "../utils";
import { processIntakeMessage, resetState } from "../stateMachine";
import { useLogger } from "../hooks/useLogger";
import { useOrders } from "../hooks/useOrders";

import StatsBar from "./StatsBar";
import CustomerPanel from "./CustomerPanel";
import BackendPanel from "./BackendPanel";
import WorkerPanel from "./WorkerPanel";

// ─── Round-robin worker assignment ────────────────────────────────────────

let rrCounter = 0;
function nextWorker() {
  const worker = WORKERS[rrCounter % WORKERS.length];
  rrCounter += 1;
  return { worker, idx: rrCounter - 1 };
}

// ─── App ──────────────────────────────────────────────────────────────────

export default function Bckend() {
  // ── State ──────────────────────────────────────────────────────────────
  const [userState, setUserState] = useState(null); // intake machine state
  const [custOrderId, setCustOrderId] = useState(null); // null while in intake
  const [selectedOrder, setSelectedOrder] = useState(null); // worker panel selection
  const [customerInput, setCustomerInput] = useState("");
  const [workerInput, setWorkerInput] = useState("");

  const { log, pushLog, clearLog } = useLogger();
  const {
    orders,
    messages,
    addMessage,
    createOrder,
    resetOrders,
    orderList,
    totalMessageCount,
  } = useOrders();

  // ── Customer sends a message ────────────────────────────────────────────
  function handleCustomerSend() {
    const text = customerInput.trim();
    if (!text) return;
    setCustomerInput("");

    // ── Hard-reset keyword ─────────────────────────────────────────────
    if (text.toLowerCase() === "restart" || text.toLowerCase() === "reset") {
      pushLog("intake", "[STATE] user reset → step: name");
      setUserState(resetState());
      addMessage(INTAKE_THREAD_KEY, makeCustomerMessage(text));
      setTimeout(() => {
        addMessage(
          INTAKE_THREAD_KEY,
          makeBotMessage(
            "Welcome back! Let's start fresh.\n\nWhat is your full name?"
          )
        );
      }, 150);
      return;
    }

    // ── Normal order chat (intake already complete) ────────────────────
    if (custOrderId) {
      const customerMsg = makeCustomerMessage(text);
      addMessage(custOrderId, customerMsg);
      pushLog(
        "request",
        `POST /send  { from:"customer", order_id:"${custOrderId}", text:"${truncate(
          text
        )}" }`
      );
      pushLog(
        "route",
        `↳ routing to assigned worker: ${orders[custOrderId]?.worker}`
      );
      return;
    }

    // ── Intake flow ────────────────────────────────────────────────────
    const customerMsg = makeCustomerMessage(text);
    addMessage(INTAKE_THREAD_KEY, customerMsg);

    const { nextState, botReply, isValid, isComplete } = processIntakeMessage(
      userState,
      text
    );

    setUserState(nextState);
    pushLog(
      "intake",
      `[STATE] ${userState?.step || "new"} → "${truncate(text, 20)}" → step: ${
        nextState.step
      }`
    );

    if (!isComplete) {
      // Not done yet — show the bot prompt after a short delay
      if (botReply) {
        setTimeout(() => {
          addMessage(INTAKE_THREAD_KEY, makeBotMessage(botReply));
        }, 150);
      }
      return;
    }

    // ── Intake complete → create order ─────────────────────────────────
    const { worker, idx } = nextWorker();

    pushLog("intake", "[STATE] intake complete — creating order");
    pushLog(
      "request",
      `POST /new-order  { type:"new_order", customer_phone:"${CUSTOMER_PHONE}", patient:"${nextState.data.name}" }`
    );
    pushLog(
      "assign",
      `created new order · round-robin[${idx}] → worker: ${worker}`
    );

    const confirmationText =
      `Thank you, ${nextState.data.name}! Your order has been created.\n\n` +
      `Our pharmacist ${worker} will review your request and get back to you shortly.`;

    // Gather the intake thread messages then create the order
    // (createOrder will move them into the order's thread)
    const currentIntakeMsgs = messages[INTAKE_THREAD_KEY] || [];

    // We need to add the bot reply to the intake msgs before promoting
    const finalIntakeMsgs = [
      ...currentIntakeMsgs,
      makeBotMessage(confirmationText),
    ];

    const orderId = createOrder(nextState.data, worker, finalIntakeMsgs);

    pushLog(
      "response",
      `{ type:"assign", order_id:"${orderId}", worker_id:"${worker}" }`
    );

    setCustOrderId(orderId);
    setSelectedOrder(orderId);
  }

  // ── Worker sends a reply ────────────────────────────────────────────────
  function handleWorkerSend() {
    const text = workerInput.trim();
    if (!text || !selectedOrder) return;
    setWorkerInput("");

    const msg = makeWorkerMessage(text);
    addMessage(selectedOrder, msg);

    pushLog(
      "request",
      `POST /send  { from:"worker", order_id:"${selectedOrder}", text:"${truncate(
        text
      )}" }`
    );
    pushLog("route", `↳ routing to customer: ${orders[selectedOrder]?.phone}`);
  }

  // ── Reset everything ───────────────────────────────────────────────────
  function handleReset() {
    setUserState(null);
    setCustOrderId(null);
    setSelectedOrder(null);
    setCustomerInput("");
    setWorkerInput("");
    rrCounter = 0;
    resetOrders();
    clearLog();
  }

  // ── Derived values ─────────────────────────────────────────────────────
  const isIntake = !custOrderId;
  const custMsgs = isIntake
    ? messages[INTAKE_THREAD_KEY] || []
    : messages[custOrderId] || [];
  const currentOrder = custOrderId ? orders[custOrderId] : null;

  // ── Layout ─────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        padding: "0 0 1rem",
      }}
    >
      {/* Stats bar */}
      <StatsBar
        orderCount={orderList.length}
        messageCount={totalMessageCount}
        workerCount={WORKERS.length}
        intakeStep={
          userState && userState.step !== "done"
            ? STEP_LABELS[userState.step]
            : null
        }
      />

      {/* Three panels */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.2fr 1fr",
          gap: "10px",
        }}
      >
        <CustomerPanel
          messages={custMsgs}
          userState={isIntake ? userState : null}
          orderId={custOrderId}
          order={currentOrder}
          input={customerInput}
          onInputChange={setCustomerInput}
          onSend={handleCustomerSend}
          onReset={handleReset}
        />

        <BackendPanel
          userState={userState}
          orderList={orderList}
          messages={messages}
          log={log}
        />

        <WorkerPanel
          orderList={orderList}
          messages={messages}
          selectedId={selectedOrder}
          onSelectOrder={setSelectedOrder}
          input={workerInput}
          onInputChange={setWorkerInput}
          onSend={handleWorkerSend}
        />
      </div>

      {/* Flow legend */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          padding: "8px 12px",
          background: "var(--color-background-secondary)",
          borderRadius: "var(--border-radius-md)",
          border: "0.5px solid var(--color-border-tertiary)",
          flexWrap: "wrap",
        }}
      >
        {[
          { dot: "#a855f7", label: "Bot (intake)" },
          { dot: "var(--color-background-success)", label: "Customer" },
          { dot: "var(--color-background-warning)", label: "Order created" },
          { dot: "var(--color-background-info)", label: "Worker reply" },
        ].map(({ dot, label }) => (
          <span
            key={label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "11px",
              color: "var(--color-text-secondary)",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: dot,
                flexShrink: 0,
              }}
            />
            {label}
          </span>
        ))}
        <span
          style={{
            marginLeft: "auto",
            fontSize: "11px",
            color: "var(--color-text-tertiary)",
            fontFamily: "var(--font-mono)",
          }}
        >
          user_state[phone] · intake before order creation
        </span>
      </div>
    </div>
  );
}
