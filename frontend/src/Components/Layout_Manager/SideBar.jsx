import React, { useEffect, useState } from "react";
import UserItem from "./UserItem";
import axios from "axios";

function SideBar() {
  const [usersList, setUsersList] = useState([]);

  const getAuthTokenFromCookies = () => {
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === "token") {
        return value;
      }
    }
    return null;
  };

  useEffect(() => {
    const authtoken = getAuthTokenFromCookies();
    if (authtoken) {
      axios
        .get("http://localhost:8000/api/users/", {
          headers: {
            Authorization: `Bearer ${authtoken}`,
          },
        })
        .then((response) => {
          console.log("Users fetched:", response.data);
          setUsersList(response.data);
        })
        .catch((error) => {
          console.error("Error fetching users:", error);
        });
    }
  }, []);

  return (
    <div className="w-72 h-screen bg-white dark:bg-gray-900 border-r dark:border-gray-800 flex flex-col">
      {/* Header */}
      <div className="text-gray-900 dark:text-white p-4 border-b dark:border-gray-800 text-lg font-semibold">
        All Chats
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto">
        {usersList.map((user) => (
          <div key={user.id}>
            <UserItem
              id={user.id}
              first_name={user.first_name}
              last_name={user.last_name}
              email={user.email}
              picture={user.picture} // if API provides a picture URL
              online={user.online} // optional prop
              lastMessage={user.lastMessage} // optional prop
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default SideBar;
