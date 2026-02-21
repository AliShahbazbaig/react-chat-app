import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // make sure it's react-router-dom
import axios from "axios";

function User_Cards() {
  const [users, setUsers] = useState([]);
  const [nextUrl, setNextUrl] = useState(null);
  const [prevUrl, setPrevUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async (url = "http://127.0.0.1:8000/api/users/") => {
    setLoading(true);
    try {
      const token = document.cookie.split("token=")[1]?.split(";")[0];
      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(res.data.results);
      setNextUrl(res.data.next);
      setPrevUrl(res.data.previous);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);


  return (
    <div className="p-6">
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md animate-pulse"
            >
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-gray-300 dark:bg-gray-700" />
              </div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded mb-3 w-3/4 mx-auto" />
              <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded-full w-20 mx-auto" />
            </div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center text-gray-600 dark:text-white">
          No users found
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="bg-white dark:bg-gray-800 shadow-md rounded-2xl p-5 hover:shadow-xl transition relative"
              >
                <div className="flex justify-center mb-4 relative">
                  <img
                    src={
                      user.image_url ||
                      `https://ui-avatars.com/api/?name=${user.first_name}`
                    }
                    alt="avatar"
                    className="w-20 h-20 rounded-full object-cover border-2 border-blue-500"
                  />
                  {/* 🟢 Message Icon */}
                  <Link
                    to={`/new/chat/${user.id}`}
                    className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition"
                    title="Message"
                  >
                    💬
                  </Link>
                </div>

                <h2 className="text-lg font-semibold text-center text-gray-800 dark:text-white">
                  {user.first_name} {user.last_name}
                </h2>

                <p className="text-sm text-center text-gray-500 dark:text-gray-300 mb-2">
                  {user.email}
                </p>

                {user.description && (
                  <p className="text-sm text-center text-gray-600 dark:text-gray-400 mb-3">
                    {user.description}
                  </p>
                )}

                {user.last_seen && (
                  <p className="text-xs text-center text-gray-400 mb-4">
                    {new Date(user.last_seen).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </p>
                )}

                <div className="flex justify-center">
                  <span
                    className={`px-3 py-1 text-xs rounded-full font-medium ${
                      user.is_online
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {user.is_online ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-4 mt-8">
            <button
              disabled={!prevUrl}
              onClick={() => fetchUsers(prevUrl)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={!nextUrl}
              onClick={() => fetchUsers(nextUrl)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default User_Cards;