import React from "react";

function SideBar() {
  const users = [
    {
      id: 1,
      name: "Ali",
      lastMessage: "See you tomorrow",
      online: true,
    },
    {
      id: 2,
      name: "Ahmed",
      lastMessage: "Send the files please",
      online: false,
    },
    {
      id: 3,
      name: "Sara",
      lastMessage: "😂😂😂",
      online: true,
    },
    {
      id: 4,
      name: "Usman",
      lastMessage: "Ok bro",
      online: false,
    },
  ];

  return (
    <div className="w-72 h-screen bg-white dark:bg-gray-900 border-r dark:border-gray-800 flex flex-col">

      {/* Header */}
      <div className="text-white p-4 border-b dark:border-gray-800 text-lg font-semibold">
        All Chats
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto">

        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center gap-3 p-3 cursor-pointer
                       hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >

            {/* Avatar */}
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold">
                {user.name[0]}
              </div>

              {/* Online indicator */}
              {user.online && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-gray-900 dark:text-white">
                {user.name}
              </div>

              <div className="text-xs text-gray-500 truncate">
                {user.lastMessage}
              </div>
            </div>

          </div>
        ))}

      </div>
    </div>
  );
}

export default SideBar;
