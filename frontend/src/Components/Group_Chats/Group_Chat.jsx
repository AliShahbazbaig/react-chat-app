import React, { useEffect, useState, useRef } from "react";
import Message_Input from "./Message_Input";
import axios from "axios";

function Group_Chat({ conversationId }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const getLoggedInUserId = () => {
    const token = document.cookie.split("token=")[1];
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return parseInt(payload.id);
    } catch (err) {
      console.error("Failed to decode token:", err);
      return null;
    }
  };

  const loggedInUserId = getLoggedInUserId();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    let intervalId;
    const fetchMessages = async () => {
      try {
        const token = document.cookie.split("token=")[1];
        await axios.post(
          `http://127.0.0.1:8000/api/groups/${conversationId}/read/`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const res = await axios.get(
          `http://127.0.0.1:8000/api/groups/${conversationId}/messages/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setMessages(res.data);
        console.log("Fetched messages for group conversation", conversationId, ":", res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    intervalId = setInterval(fetchMessages, 3000);

    return () => clearInterval(intervalId);
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatDate = (isoString) =>
    new Date(isoString).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  useEffect(() => {
    setLoading(true);
  }, [conversationId]);

  if (loading) return <p className="text-center mt-4">Loading messages...</p>;
  if (!messages || messages.length === 0)
    return <p className="text-center mt-4 text-gray-500">No messages yet</p>;

return (
  <div className="flex flex-col h-full">

    <div className="flex-1 p-4 space-y-2 overflow-y-auto">
      {messages.map((msg) => {
        const isMine = msg.sender_id === loggedInUserId;

        return (
          <div
            key={msg.id}
            className={`flex ${isMine ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] px-4 py-2 rounded-lg shadow break-words ${
                isMine
                  ? "bg-blue-500 text-white rounded-br-none"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none"
              }`}
            >
              {!isMine && (
                <div className="text-xs font-semibold mb-1">
                  {msg.sender_name}
                </div>
              )}

              <div className="text-sm">{msg.text}</div>

              <div className="text-xs text-gray-400 mt-1 text-right">
                {formatDate(msg.timestamp)}
              </div>
            </div>
          </div>
        );
      })}

      <div ref={messagesEndRef} />
    </div>
      <Message_Input
        conversation_id={conversationId}
        onMessageSent={(newMsg) =>
          setMessages((prev) => [...prev, newMsg])
        }
      />
  </div>
)
}

export default Group_Chat;