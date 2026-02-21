// Updated SideBar.jsx with users list
import React, { useEffect, useState } from "react";
import UserItem from "./UserItem";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

function SideBar() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const navigate = useNavigate();

  // Fetch all users except current user
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/users/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchUsers();
    }
  }, [token]);

  const handleUserClick = async (userId) => {
    try {
      setLoading(true);
      console.log('Creating/getting conversation with user:', userId);
      
      const response = await fetch(`http://localhost:8000/api/conversations/${userId}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Conversation created/fetched:', data);
      
      // Navigate to the conversation
      navigate(`/chat/${data.id}`);
      
    } catch (error) {
      console.error('Error creating conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-72 h-screen bg-white border-r flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="w-72 h-screen bg-white dark:bg-gray-900 border-r dark:border-gray-800 flex flex-col">
      {/* Header */}
      <div className="text-gray-900 dark:text-white p-4 border-b dark:border-gray-800 text-lg font-semibold">
        Users
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto">
        {users.map((user) => (
          <div key={user.id} onClick={() => handleUserClick(user.id)}>
            <UserItem
              first_name={user.first_name}
              last_name={user.last_name}
              email={user.email}
              picture={user.picture}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default SideBar;