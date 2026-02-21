// UserItem.jsx
import React from "react";

function UserItem({ first_name, last_name, email, picture, lastMessage, lastMessageTime, unreadCount }) {
  return (
    <div className="flex items-center p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition border-b border-gray-200 dark:border-gray-700">
      {/* Avatar */}
      <div className="relative">
        {picture ? (
          <img
            src={picture}
            alt={`${first_name} ${last_name}`}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
            {`${first_name?.[0] || ""}${last_name?.[0] || ""}`}
          </div>
        )}
      </div>

      {/* User Info */}
      <div className="flex-1 min-w-0 ml-4">
        <div className="flex justify-between items-center">
          <div className="font-medium text-sm text-gray-900 dark:text-white">
            {first_name} {last_name}
          </div>
          {lastMessageTime && (
            <div className="text-xs text-gray-500">
              {new Date(lastMessageTime).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          )}
        </div>
        {lastMessage ? (
          <div className="text-xs text-gray-500 dark:text-gray-400 truncate flex justify-between">
            <span>{lastMessage}</span>
           {unreadCount > 0 && (
              <span className="bg-blue-500 text-white rounded-full px-2 py-0.5 text-xs ml-2">
                {unreadCount}
              </span>
            )}
          </div>
        ) : (
          <div className="text-xs text-gray-400 truncate">
            {email}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserItem;