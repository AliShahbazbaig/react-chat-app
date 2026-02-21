import React, { useEffect, useState } from "react";
import axios from "axios";
import Group_Chat from "./Group_Chat";

function GroupList() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const token = document.cookie.split("token=")[1];
        const res = await axios.get(
          "http://127.0.0.1:8000/api/groups/my/",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setGroups(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  if (loading)
    return <p className="text-center mt-4">Loading groups...</p>;

  return (
    <div className="flex h-full">
      {/* LEFT SIDE — Group List */}
      <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 overflow-y-auto p-2">
        {groups.map((group) => (
          <div
            key={group.conversation_id}
            onClick={() => setSelectedGroup(group)}
            className={`flex items-center justify-between px-4 py-3 mb-3 bg-white dark:bg-gray-900 rounded-xl shadow hover:shadow-lg transition cursor-pointer w-full ${
              selectedGroup?.conversation_id === group.conversation_id
                ? "bg-gray-200 dark:bg-gray-700"
                : ""
            }`}
          >
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg">
                {group.name.charAt(0)}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 ml-4">
              <div className="flex justify-between items-center">
                <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100">
                  {group.name}
                </h3>

                {group.last_message_time && (
                  <span className="text-xs text-gray-400">
                    {new Date(group.last_message_time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
              </div>

              {/* Last Message */}
              <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                {group.last_message
                  ? `${group.last_message}`
                  : "No messages yet"}
              </p>
            </div>

            {/* Unread Count */}
            {group.unread_count > 0 && (
              <div className="ml-2 flex-shrink-0">
                <span className="px-2 py-1 text-xs font-semibold text-white bg-blue-500 rounded-full">
                  {group.unread_count}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* RIGHT SIDE — Chat Window */}
      <div className="w-2/3">
        {selectedGroup ? (
          <Group_Chat conversationId={selectedGroup.conversation_id} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            Select a group
          </div>
        )}
      </div>
    </div>
  );
}

export default GroupList;