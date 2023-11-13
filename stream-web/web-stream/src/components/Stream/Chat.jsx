import React, { useState, useEffect } from "react";
import "./Chat.css";

const Chat = () => {
  const [messages, setMessages] = useState([
    { id: 1, user: "User1", content: "Hello everyone!" },
    { id: 2, user: "User2", content: "Hi there!" },
    // ... more messages
  ]);
  const [input, setInput] = useState("");

  const sendMessage = (event) => {
    event.preventDefault();
    if (input.trim()) {
      const newMessage = {
        id: messages.length + 1,
        user: "You",
        content: input,
      };
      setMessages([...messages, newMessage]);
      setInput(""); // Clear input after sending
    }
  };

  useEffect(() => {
    // Scroll to the latest message
    const chatMessagesEl = document.querySelector(".chat-messages");
    if (chatMessagesEl) {
      chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((message) => (
          <div key={message.id} className="chat-message">
            <strong>{message.user}</strong>: {message.content}
          </div>
        ))}
      </div>
      <form className="chat-input-form" onSubmit={sendMessage}>
        <input
          type="text"
          className="chat-input"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" className="chat-send-button">
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
