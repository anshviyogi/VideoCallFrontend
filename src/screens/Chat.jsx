import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/SocketProvider";

function Chat() {
  const socket = useSocket();
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);

  const sendChat = useCallback(() => {
    socket.emit("chat:incoming", { chat });
  }, [chat]);

  const chatFromServer = useCallback(
    (data) => {
      setMessages((prevMessages) => [...prevMessages, data.chat]);
    },
    []
  );

  useEffect(() => {
    socket.on("server:outgoing", chatFromServer);

    // Cleanup socket event listener on component unmount
    return () => {
      socket.off("server:outgoing", chatFromServer);
    };
  }, [socket, chatFromServer]);
  return (
    <div>
      <h1>Chat Page</h1>
      <input
        className="border border-gray-400 outline-none rounded-sm"
        value={chat}
        onChange={(e) => setChat(e.target.value)}
        placeholder="Type your chat..."
      />
      <button onClick={sendChat}>Send Chat</button>

      <h1>Chat Messages: </h1>
      {messages?.map((item) => {
        return <li>{item}</li>;
      })}
    </div>
  );
}

export default Chat;
