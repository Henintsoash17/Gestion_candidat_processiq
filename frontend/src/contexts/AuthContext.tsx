"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import {
  applyLoginToken,
  AuthUser,
  clearStoredAuth,
  readInitialUserFromStorage,
} from "@/lib/authSession";

interface AuthContextType {
  user: AuthUser | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(() => readInitialUserFromStorage());

  const login = (token: string) => {
    const nextUser = applyLoginToken(token);
    setUser(nextUser);
  };

  const logout = () => {
    clearStoredAuth();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
