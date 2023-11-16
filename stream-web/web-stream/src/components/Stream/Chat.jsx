import React, { useState } from "react";
import "./Chat.css";
import useWebSocket from "./useWebSocket";

const Chat = () => {
  const { messages, sendMessage } = useWebSocket(
    "wss://o0p8o0v62i.execute-api.ap-northeast-2.amazonaws.com/dev/"
  );
  const [input, setInput] = useState("");

  const handleSendMessage = () => {
    if (input.trim()) {
      sendMessage({ Message: input });
      setInput("");
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className="chat-message">
            <strong>{message.User}</strong>: {message.Data}
          </div>
        ))}
      </div>
      <div className="chat-input-form">
        <input
          type="text"
          className="chat-input"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
        />
        <button onClick={handleSendMessage} className="chat-send-button">
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
