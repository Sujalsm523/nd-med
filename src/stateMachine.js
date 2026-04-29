/**
 * stateMachine.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Pure functions that implement the user intake state machine.
 *
 * State shape:
 *   {
 *     step: "name" | "age" | "sex" | "address" | "prescription" | "done",
 *     data: {
 *       name:         string,
 *       age:          string,
 *       sex:          string,
 *       address:      string,
 *       prescription: string,
 *     }
 *   }
 *
 * Each `handle*` function receives the current state + raw user input and
 * returns:
 *   { nextState, botReply, isValid }
 *
 * `isValid: false` means the step was not advanced — the bot reply is a
 * re-prompt / error message.
 */

import { STEP_PROMPTS, WELCOME_MESSAGE } from "./constants";
import { normalizeGender } from "./utils";

// ─── Initial state factory ─────────────────────────────────────────────────

export function createInitialState() {
  return {
    step: "name",
    data: { name: "", age: "", sex: "", address: "", prescription: "" },
  };
}

// ─── Step handlers ─────────────────────────────────────────────────────────

/**
 * Called when the user sends their very first message (no existing state).
 * We initialise the machine and return the welcome greeting.
 */
export function handleNewUser() {
  return {
    nextState: createInitialState(),
    botReply:  WELCOME_MESSAGE,
    isValid:   true,
  };
}

/**
 * Collect the user's name (any non-empty string is accepted).
 */
function handleName(state, input) {
  const name = input.trim();
  if (!name) {
    return {
      nextState: state,
      botReply:  "Please enter your full name.",
      isValid:   false,
    };
  }
  return {
    nextState: { step: "age", data: { ...state.data, name } },
    botReply:  STEP_PROMPTS.age,
    isValid:   true,
  };
}

/**
 * Collect the user's age.  Must be a whole number between 0 and 130.
 */
function handleAge(state, input) {
  const age = parseInt(input.trim(), 10);
  if (isNaN(age) || age < 0 || age > 130) {
    return {
      nextState: state,
      botReply:  "Please enter a valid age (e.g. 28).",
      isValid:   false,
    };
  }
  return {
    nextState: { step: "sex", data: { ...state.data, age: String(age) } },
    botReply:  STEP_PROMPTS.sex,
    isValid:   true,
  };
}

/**
 * Collect gender.  Accepts "1/2/3", "m/f/o", or full words.
 */
function handleSex(state, input) {
  const sex = normalizeGender(input);
  if (!sex) {
    return {
      nextState: state,
      botReply:  "Please reply with 1 (Male), 2 (Female), or 3 (Other).",
      isValid:   false,
    };
  }
  return {
    nextState: { step: "address", data: { ...state.data, sex } },
    botReply:  STEP_PROMPTS.address,
    isValid:   true,
  };
}

/**
 * Collect delivery address.
 */
function handleAddress(state, input) {
  const address = input.trim();
  if (!address) {
    return {
      nextState: state,
      botReply:  "Please enter your delivery address.",
      isValid:   false,
    };
  }
  return {
    nextState: { step: "prescription", data: { ...state.data, address } },
    botReply:  STEP_PROMPTS.prescription,
    isValid:   true,
  };
}

/**
 * Collect prescription (optional — "skip" is accepted).
 */
function handlePrescription(state, input) {
  const isSkip       = input.trim().toLowerCase() === "skip";
  const prescription = isSkip ? "(none)" : input.trim();
  return {
    nextState: { step: "done", data: { ...state.data, prescription } },
    botReply:  null,   // caller builds the order-confirmation message
    isValid:   true,
  };
}

// ─── Dispatcher ────────────────────────────────────────────────────────────

const HANDLERS = {
  name:         handleName,
  age:          handleAge,
  sex:          handleSex,
  address:      handleAddress,
  prescription: handlePrescription,
};

/**
 * Route a raw user message through the correct step handler.
 *
 * @param {object|null} currentState  - Current machine state (null = first message)
 * @param {string}      input         - Raw user text
 * @returns {{ nextState, botReply, isValid, isComplete }}
 *   isComplete = true when nextState.step === "done"
 */
export function processIntakeMessage(currentState, input) {
  // First message from this user
  if (!currentState) {
    const result = handleNewUser();
    return { ...result, isComplete: false };
  }

  const handler = HANDLERS[currentState.step];
  if (!handler) {
    // Should never happen, but guard anyway
    return { nextState: currentState, botReply: null, isValid: false, isComplete: false };
  }

  const result = handler(currentState, input);
  return {
    ...result,
    isComplete: result.nextState.step === "done",
  };
}

/**
 * Reset the state machine back to its initial state (step: "name").
 */
export function resetState() {
  return createInitialState();
}
