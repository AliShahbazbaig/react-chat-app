import React, { useState } from "react";
import axios from "axios";

function Message_Input({ conversation_id, onMessageSent }) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const getToken = () => document.cookie.split("token=")[1];

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!text.trim()) return;

    setSending(true);

    try {
      const res = await axios.post(
        `http://127.0.0.1:8000/api/groups/${conversation_id}/send/`,
        {
          message: text,
        },
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      setText("");

      if (onMessageSent) onMessageSent(res.data);

    } catch (err) {
      console.error("Send message error:", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <form
      onSubmit={sendMessage}
      className="flex items-center gap-2 p-3 border-t dark:border-gray-700 bg-white dark:bg-gray-900"
    >
      <input
        type="text"
        placeholder="Type a message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={sending}
        className="text-white flex-1 px-4 py-2 rounded-full border dark:border-gray-600 
                   bg-gray-100 dark:bg-gray-800 
                   text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <button
        type="submit"
        disabled={sending}
        className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm
                   hover:bg-blue-700 disabled:opacity-50"
      >
        Send
      </button>
    </form>
  );
}

export default Message_Input;