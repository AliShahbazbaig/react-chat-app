import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find(row => row.startsWith("token="));

    setIsAuthenticated(!!token);
  }, []);

  // Prevent redirect flicker while checking
  if (isAuthenticated === null) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
}
