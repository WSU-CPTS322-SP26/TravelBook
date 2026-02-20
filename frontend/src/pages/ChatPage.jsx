// src/pages/ChatPage.jsx
import React, { useState } from "react";


const initialMessages = [
  { id: 1, author: "Alex", text: "Excited for tapas and beach days!", mine: false },
  { id: 2, author: "Sarah", text: "Don’t forget to pack sunscreen.", mine: false },
  { id: 3, author: "Me", text: "Flights and hotel are all set ✅", mine: true },
];

export default function ChatPage() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        author: "Me",
        text: input.trim(),
        mine: true,
      },
    ]);
    setInput("");
  };

  return (
    <div className="page-container chat-page">
      <div className="chat-header">
        <div>
          <h2>Barcelona Getaway</h2>
          <p className="muted">Group chat • June 15 – June 20</p>
        </div>
        <div className="avatar-stack">
          <div className="avatar-circle">A</div>
          <div className="avatar-circle">S</div>
          <div className="avatar-circle">E</div>
          <div className="avatar-circle">M</div>
        </div>
      </div>

      <div className="chat-body">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`chat-message-row ${m.mine ? "mine" : "theirs"}`}
          >
            {!m.mine && <div className="chat-author">{m.author}</div>}
            <div className={`chat-bubble ${m.mine ? "mine" : "theirs"}`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <form className="chat-input-row" onSubmit={handleSend}>
        <input
          className="text-input chat-input"
          placeholder="Send a message to the group…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="btn-primary chat-send-btn" type="submit">
          Send
        </button>
      </form>
    </div>
  );
}
