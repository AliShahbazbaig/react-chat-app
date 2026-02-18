import React from "react";
import { Link } from "react-router-dom";

function UserItem({ id,first_name, last_name, email, picture, online, lastMessage, }) {
  const userProfileLink = `/user/chat/${id}`;
  return (
    <Link to={userProfileLink}>
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
            <div className="w-12 h-12 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold text-lg">
              {`${first_name?.[0] || ""}${last_name?.[0] || ""}`}
            </div>
          )}

          {/* Online indicator */}
          {online && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0 ml-4">
          <div className="font-medium text-sm text-gray-900 dark:text-white">
            {first_name} {last_name}
          </div>
          {lastMessage && (
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {lastMessage}
            </div>
          )}
          {!lastMessage && (
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {email}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default UserItem;
