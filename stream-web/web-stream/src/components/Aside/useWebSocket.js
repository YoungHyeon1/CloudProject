// useWebSocket.js
import { useState, useEffect, useRef } from "react";

const useWebSocket = (url) => {
  const [messages, setMessages] = useState([]);
  const socket = useRef(null);

  useEffect(() => {
    socket.current = new WebSocket(url);
    socket.current.onopen = () => {
      console.log("WebSocket Connected");
    };

    socket.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.Message === undefined) {
        return;
      }
      console.log(data.Message);
      setMessages((prevMessages) => {
        const update_data = [
          ...prevMessages,
          {
            Data: data.Message,
            User: sessionStorage.getItem("userName"),
          },
        ];
        return update_data;
      });
    };

    socket.current.onclose = () => {
      console.log("WebSocket Disconnected");
    };

    return () => {
      if (socket.current) {
        socket.current.close();
      }
    };
  }, [url]);

  const sendMessage = (message) => {
    console.log(message);
    if (socket.current && socket.current.readyState === WebSocket.OPEN) {
      socket.current.send(JSON.stringify(message));
    }
  };

  return { messages, sendMessage };
};

export default useWebSocket;
