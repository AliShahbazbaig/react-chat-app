import React, { useEffect, useState } from "react";
import axios from "axios";
import ChatWindow from "./Chat";

function Chats() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const token = document.cookie.split("token=")[1];

        const res = await axios.get(
          "http://127.0.0.1:8000/api/my/conversations/",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setConversations(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  if (loading)
    return <p className="text-center mt-4">Loading...</p>;

  return (
    <div className="flex h-full">
      {/* LEFT SIDE — Conversation List */}
      <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 overflow-y-auto p-2">
        {conversations.map((conv) => {
          const user = conv.other_user;
          const lastMessage = conv.last_message;

          return (
            <div
              key={conv.id}
              onClick={() => setSelectedConversation(conv)}
              className="flex items-center justify-between px-4 py-3 mb-3 bg-white dark:bg-gray-900 rounded-xl shadow hover:shadow-lg transition cursor-pointer w-full"
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-200 font-bold text-lg">
                  {user.first_name?.[0] || "U"}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 ml-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                    {user.first_name} {user.last_name}

                    {user.is_online && (
                      <span className="ml-2 w-2 h-2 bg-green-500 rounded-full inline-block" />
                    )}
                  </h3>

                  {lastMessage && (
                    <span className="text-xs text-gray-400">
                      {new Date(
                        lastMessage.timestamp
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>

                {/* Last Message */}
                <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                  {lastMessage
                    ? `${lastMessage.sender_name}: ${lastMessage.text}`
                    : "No messages yet"}
                </p>
              </div>

              {/* Unread Count */}
              {conv.unread_count_user2 > 0 && (
                <div className="ml-2 flex-shrink-0">
                  <span className="px-2 py-1 text-xs font-semibold text-white bg-blue-500 rounded-full">
                    {conv.unread_count_user2}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* RIGHT SIDE — Chat Window */}
      <div className="w-2/3">
        {selectedConversation ? (
          <ChatWindow
            conversationId={selectedConversation.id}
            otherUserId={selectedConversation.other_user.id}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            Select a conversation
          </div>
        )}
      </div>
    </div>
  );
}

export default Chats;