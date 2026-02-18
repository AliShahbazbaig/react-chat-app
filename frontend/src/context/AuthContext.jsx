import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const getTokenFromCookie = () => {
    const cookies = document.cookie.split('; ');
    const tokenCookie = cookies.find(row => row.startsWith('token='));
    return tokenCookie ? tokenCookie.split('=')[1] : null;
  };

  // Fetch user data using the token
  const fetchUserData = async (authToken) => {
    try {
      const response = await fetch('http://localhost:8000/api/user/', { // Adjust this endpoint
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        // Store in localStorage as backup
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      } else {
        console.error('Failed to fetch user data');
        // Try to get from localStorage as fallback
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Try localStorage as fallback
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const cookieToken = getTokenFromCookie();
      
      if (cookieToken) {
        setToken(cookieToken);
        // Also store in localStorage for WebSocket
        localStorage.setItem('token', cookieToken);
        
        // Try to get user from localStorage first
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        
        // Then fetch fresh user data
        await fetchUserData(cookieToken);
      } else {
        // Check localStorage as fallback
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (authToken, userData) => {
    // Set cookie
    document.cookie = `token=${authToken}; path=/; max-age=86400`; // 24 hours
    
    // Set localStorage
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    
    setToken(authToken);
    setUser(userData);
  };

  const logout = () => {
    // Clear cookie
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};