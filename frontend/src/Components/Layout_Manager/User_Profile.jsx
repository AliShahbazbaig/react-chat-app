import React, { useEffect, useState } from "react";
import axios from "axios";


function User_Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/profile/",{
        headers:{
            Authorization: `Bearer ${document.cookie.split('token=')[1]}`
        }
      })
      .then((response) => {
        setUser(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching user:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500 font-semibold">Failed to load user</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
            <div className="flex justify-center mb-6">
            <img
                src={
                user.image_url ||
                "https://placehold.co/600x400/black/white"
                }
                alt="Profile"
                className="w-28 h-28 rounded-full object-cover border-4 border-blue-500"
            />
            </div>

            <h2 className="text-2xl font-bold text-center mb-2">
            {user.first_name} {user.last_name || ""}
            </h2>

            <p className="text-gray-600 text-center mb-4">
            {user.email}
            </p>

            <p className="text-gray-700 text-center mb-6">
            {user.description || "No description available"}
            </p>


            <div className="flex justify-center">
            <span
                className={`px-4 py-1 rounded-full text-sm font-semibold ${
                user.is_online
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
            >
                {user.is_online ? "Active" : "Inactive"}
            </span>
            </div>
      </div>
    </div>
  );
}

export default User_Profile;
