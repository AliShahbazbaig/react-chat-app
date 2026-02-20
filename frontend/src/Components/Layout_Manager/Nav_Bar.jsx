import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          "http://127.0.0.1:8000/api/user/",{
            headers: {
              Authorization: `Bearer ${document.cookie.split('token=')[1]}`
            }
          }
        );

        setUser(res.data);
      } catch (error) {
        setUser(null); // Not logged in
      }
    };

    fetchUser();
  }, []);

  return (
    <header className="bg-white dark:bg-gray-900 shadow">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="flex h-16 items-center justify-between">

          <Link
            to="/"
            className="text-xl font-bold text-teal-600 dark:text-teal-300"
          >
            LOGO
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link to="/chats" className="text-gray-600 hover:text-teal-600 dark:text-white">My Chats</Link>
            <Link to="/groups" className="text-gray-600 hover:text-teal-600 dark:text-white">My Groups</Link>
            <Link to="/users" className="text-gray-600 hover:text-teal-600 dark:text-white">All Users</Link>
            <Link to="/profile" className="text-gray-600 hover:text-teal-600 dark:text-white">Profile</Link>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {!user ? (
              <>
                <Link to="/login" className="bg-teal-600 px-5 py-2 rounded text-white">
                  Login
                </Link>
                <Link to="/signup" className="bg-gray-100 px-5 py-2 rounded text-teal-600 dark:bg-gray-800 dark:text-white">
                  Register
                </Link>
              </>
            ) : (
              <Link to="/profile" className="flex items-center gap-3">
                <img
                  src={user.image_url || "/default-avatar.png"}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {user.first_name} {user.last_name}
                  </span>
                  <span className="text-xs text-gray-500">{user.email}</span>
                </div>
              </Link>
            )}
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="
              md:hidden p-2 rounded-lg
              bg-gray-100 dark:bg-gray-800
              hover:bg-gray-200 dark:hover:bg-gray-700
              active:scale-95
              transition
              shadow-sm
            "
          >
            <span className="text-xl">{menuOpen ? "✕" : "☰"}</span>
          </button>
        </div>

        {menuOpen && (
          <>
            <div
              className="md:hidden fixed inset-0 bg-black/30 z-40"
              onClick={() => setMenuOpen(false)}
            />

            <div
              className="
                md:hidden fixed top-0 right-0 h-full w-72 z-50
                bg-white dark:bg-gray-900
                shadow-2xl
                p-5 space-y-4
              "
            >
              <div className="flex justify-end">
                <button
                  onClick={() => setMenuOpen(false)}
                  className="
                  text-white
                    p-2 rounded-lg
                    bg-gray-100 dark:bg-gray-800
                    hover:bg-gray-200 dark:hover:bg-gray-700
                    active:scale-95
                    transition
                  "
                >
                  ✕
                </button>
              </div>

              {/* NAV LINKS */}
              <Link
                to="/chats"
                onClick={() => setMenuOpen(false)}
                className="text-white block px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                My Chats
              </Link>

              <Link
                to="/groups"
                onClick={() => setMenuOpen(false)}
                className="text-white block px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                My Groups
              </Link>

              <Link
                to="/users"
                onClick={() => setMenuOpen(false)}
                className="text-white block px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                All Users
              </Link>

              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className="text-white block px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                Profile
              </Link>

              <div className="border-t pt-4 dark:border-gray-700" />

              {/* USER SECTION */}
              {!user ? (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="block bg-teal-600 text-white px-4 py-2 rounded text-center hover:bg-teal-700 transition"
                  >
                    Login
                  </Link>

                  <Link
                    to="/signup"
                    onClick={() => setMenuOpen(false)}
                    className="block bg-gray-200 dark:bg-gray-800 px-4 py-2 rounded text-center hover:bg-gray-300 dark:hover:bg-gray-700 transition"
                  >
                    Register
                  </Link>
                </>
              ) : (
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded p-2 transition"
                >
                  <img
                    src={user.image_url || "/default-avatar.png"}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover"
                  />

                  <div>
                    <div className="font-semibold dark:text-white">
                      {user.first_name} {user.last_name}
                    </div>
                    <div className="text-xs font-bold text-gray-500">{user.email}</div>
                  </div>
                </Link>
              )}
            </div>
          </>
        )}


      </div>
    </header>

  );
}

export default NavBar;
