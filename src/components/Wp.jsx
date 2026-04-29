import { useState } from "react";

import { makeCustomerMessage, makeBotMessage } from "../utils";
import { processIntakeMessage } from "../stateMachine";
import { useOrders } from "../hooks/useOrders";
import CustomerPanel from "../components/CustomerPanel";

// 🔥 Single persistent chat thread
const CHAT_THREAD = "medical_chat";

// Sidebar dummy chats
const chats = [
  { id: 1, name: "Medical" },
  { id: 2, name: "Rahul" },
  { id: 3, name: "Ayesha" },
  { id: 4, name: "Priya" },
];

export default function Wp() {
  const [selectedChat, setSelectedChat] = useState(chats[0]);
  const [userState, setUserState] = useState(null);
  const [customerInput, setCustomerInput] = useState("");

  const { orders, messages, addMessage, createOrder } = useOrders();
  const exportCSV = () => {
    const data = Object.values(orders);

    if (!data.length) {
      alert("No orders to export");
      return;
    }

    const headers = [
      "Order ID",
      "Name",
      "Age",
      "Sex",
      "Address",
      "Prescription",
      "Phone",
      "Status",
      "Created",
    ];

    const rows = data.map((o) => [
      o.id,
      o.patientName,
      o.patientAge,
      o.patientSex,
      o.address,
      o.prescription,
      o.phone,
      o.status,
      o.created,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "orders.csv");
    document.body.appendChild(link);

    link.click();
  };
  const handleSend = (text) => {
    const finalText = typeof text === "string" ? text : customerInput;
    if (!finalText || !finalText.trim()) return;

    // 👤 user message
    addMessage(CHAT_THREAD, makeCustomerMessage(finalText));

    const result = processIntakeMessage(userState, finalText);
    console.log("👉 RESULT:", result);

    // 🤖 bot reply
    if (result?.botReply) {
      addMessage(CHAT_THREAD, makeBotMessage(result.botReply));
    } else if (result?.isComplete) {
      addMessage(CHAT_THREAD, makeBotMessage("✅ Your order has been created"));
      addMessage(
        CHAT_THREAD,
        makeBotMessage(
          "Our pharmacist Ayesha will review your request and get back to you shortly"
        )
      );
    }

    // state handling
    if (!result?.isComplete) {
      setUserState(result?.nextState);
    } else {
      createOrder(result?.nextState?.data); // no UI impact
      setUserState(null);
    }

    setCustomerInput("");
  };

  return (
    <div className="flex h-screen bg-[#111b21] text-white">
      {/* 🔹 LEFT SIDEBAR */}
      <div className="w-[30%] bg-[#202c33] border-r border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 bg-[#202c33] flex items-center justify-between">
          <h2 className="text-lg font-semibold">WhatsApp</h2>
        </div>

        {/* Search */}
        <div className="p-3">
          <input
            placeholder="Search or start new chat"
            className="w-full p-2 rounded bg-[#2a3942] outline-none text-sm"
          />
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className={`p-4 cursor-pointer hover:bg-[#2a3942] ${
                selectedChat.id === chat.id ? "bg-[#2a3942]" : ""
              }`}
            >
              <div className="font-medium">{chat.name}</div>
              <div className="text-xs text-gray-400">
                {chat.id === 1 ? "Medical support" : "Last message preview"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🔹 RIGHT CHAT AREA */}
      <div className="flex flex-col w-[70%]">
        {/* Header */}
        <div className="p-4 bg-[#202c33] border-b border-gray-700 flex items-center">
          <h3 className="font-semibold">{selectedChat.name}</h3>
        </div>

        {/* Chat */}
        <div className="flex-1 bg-[#0b141a] overflow-y-auto p-4">
          {selectedChat.name === "Medical" ? (
            <CustomerPanel
              messages={messages?.[CHAT_THREAD] || []}
              input={customerInput}
              onInputChange={setCustomerInput}
              onSend={() => handleSend(customerInput)}
            />
          ) : (
            <div className="text-gray-400 text-center mt-20">
              This chat is UI only
            </div>
          )}
          <button
            onClick={exportCSV}
            className="bg-green-600 px-3 py-2 rounded m-2"
          >
            Export CSV
          </button>
        </div>
      </div>
    </div>
  );
}
