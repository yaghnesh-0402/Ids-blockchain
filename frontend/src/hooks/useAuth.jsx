import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser, loginUser, logoutUser, registerUser } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function hydrateSession() {
      try {
        const session = await getCurrentUser();
        if (isMounted) {
          setUser(session.user);
        }
      } catch (sessionError) {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    hydrateSession();

    return () => {
      isMounted = false;
    };
  }, []);

  async function login(credentials) {
    setError("");
    const data = await loginUser(credentials);
    setUser(data.user);
    return data.user;
  }

  async function register(payload) {
    setError("");
    const data = await registerUser(payload);
    setUser(data.user);
    return data.user;
  }

  async function logout() {
    setError("");
    await logoutUser();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, setError, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
