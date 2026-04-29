/**
 * useOrders.js
 * ─────────────────────────────────────────────────────────────────────────
 * Custom hook that owns the orders dictionary and the messages dictionary.
 *
 * orders   : { [orderId]: OrderObject }
 * messages : { [orderId | "__intake"]: MessageObject[] }
 *
 * Exposed helpers:
 *   createOrder(patientData, worker)  → orderId
 *   addMessage(threadId, msgObj)
 *   promoteIntakeThread(newOrderId)   — moves "__intake" messages to the real order
 *   resetOrders()
 */

import { useState } from "react";
import { genOrderId, timestamp } from "../utils";
import { CUSTOMER_PHONE, INTAKE_THREAD_KEY } from "../constants";

export function useOrders() {
  const [orders, setOrders] = useState({});
  const [messages, setMessages] = useState({});

  /**
   * Add a message to any thread (by orderId or INTAKE_THREAD_KEY).
   */
  function addMessage(threadId, msgObj) {
    setMessages((prev) => ({
      ...prev,
      [threadId]: [...(prev[threadId] || []), msgObj],
    }));
  }

  /**
   * Create a new order from completed intake data.
   * Returns the new order ID.
   *
   * @param {object} patientData  - { name, age, sex, address, prescription }
   * @param {string} worker       - Assigned worker name
   * @param {MessageObject[]} intakeHistory - Messages accumulated during intake
   */
  function createOrder(patientData, worker, intakeHistory = []) {
    const orderId = genOrderId();
    const order = {
      id: orderId,
      phone: CUSTOMER_PHONE,
      worker,
      status: "open",
      created: timestamp(),
      patientName: patientData.name,
      patientAge: patientData.age,
      patientSex: patientData.sex,
      address: patientData.address,
      prescription: patientData.prescription,
    };

    setOrders((prev) => ({ ...prev, [orderId]: order }));

    // Seed the order's message thread with the intake conversation
    setMessages((prev) => {
      const updated = { ...prev, [orderId]: intakeHistory };
      delete updated[INTAKE_THREAD_KEY]; // remove temporary intake thread
      return updated;
    });

    return orderId;
  }

  /**
   * Wipe all state (used by the Reset button).
   */
  function resetOrders() {
    setOrders({});
    setMessages({});
  }

  return {
    orders,
    messages,
    addMessage,
    createOrder,
    resetOrders,
    orderList: Object.values(orders),
    totalMessageCount: Object.values(messages).reduce(
      (acc, m) => acc + m.length,
      0
    ),
  };
}
