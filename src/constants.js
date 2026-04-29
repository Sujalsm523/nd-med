// ─── App-wide constants ────────────────────────────────────────────────────

export const WORKERS = ["Ayesha", "Rahul", "Priya"];

export const CUSTOMER_PHONE = "+91 98765 43210";

// Ordered list of intake steps (state machine progression)
export const INTAKE_STEPS = [
  "name",
  "age",
  "sex",
  "address",
  "prescription",
  "done",
];

export const STEP_LABELS = {
  name: "Name",
  age: "Age",
  sex: "Gender",
  address: "Address",
  prescription: "Prescription",
  done: "Complete",
};

// Bot prompt text for each intake step
export const STEP_PROMPTS = {
  name: "What is your full name?",
  age: "What is your age?",
  sex: "Please select your gender:\n1  Male\n2  Female\n3  Other",
  address: "Please enter your delivery address:",
  prescription: "Please type your medicine names or prescription details.\n\n",
};

// Welcome message shown when a brand-new user sends their first message
export const WELCOME_MESSAGE =
  "Hi! Welcome to Navdeep Enterprises.\n\nWhat is your full name?";

// Colours used in the backend log panel per entry type
export const LOG_COLORS = {
  system: "var(--color-text-tertiary)",
  request: "var(--color-text-info)",
  assign: "var(--color-text-warning)",
  response: "var(--color-text-success)",
  route: "var(--color-text-secondary)",
  intake: "#c084fc", // purple — distinct from API colours
};

// Temporary key used for the message list while intake is in progress
// (before a real order ID is known)
export const INTAKE_THREAD_KEY = "__intake";
