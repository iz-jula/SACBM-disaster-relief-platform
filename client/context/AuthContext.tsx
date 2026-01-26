import React, { createContext, useState, useContext, ReactNode } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  user: { email: string; name: string } | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);

  // Simple hardcoded credentials for demo (replace with real auth in production)
  const VALID_CREDENTIALS = [
    { email: "admin@sabcm.org", password: "admin123", name: "Admin User" },
    { email: "manager@sabcm.org", password: "manager123", name: "Manager User" },
  ];

  const login = async (email: string, password: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const foundUser = VALID_CREDENTIALS.find(
      (cred) => cred.email === email && cred.password === password
    );

    if (foundUser) {
      setIsAuthenticated(true);
      setUser({ email: foundUser.email, name: foundUser.name });
      // Store auth in localStorage for persistence
      localStorage.setItem("auth", JSON.stringify({ email: foundUser.email, name: foundUser.name }));
    } else {
      throw new Error("Invalid email or password");
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem("auth");
  };

  // Check for existing auth on mount
  React.useEffect(() => {
    const stored = localStorage.getItem("auth");
    if (stored) {
      try {
        const userData = JSON.parse(stored);
        setUser(userData);
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem("auth");
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
