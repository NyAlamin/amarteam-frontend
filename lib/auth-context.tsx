"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { authAPI } from "./api";
import { User, Role } from "./types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
  isPlayer: boolean;
  isHirer: boolean;
  isVerified: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const COOKIE_OPTS = {
  expires: 7,
  secure: typeof window !== "undefined" && window.location.protocol === "https:",
  sameSite: "strict" as const,
  path: "/",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = Cookies.get("token");
    if (!saved) { setLoading(false); return; }

    try {
      const decoded: any = jwtDecode(saved);
      if (decoded.exp * 1000 > Date.now()) {
        setToken(saved);
        fetchUser();
      } else {
        Cookies.remove("token", { path: "/" });
        setLoading(false);
      }
    } catch {
      Cookies.remove("token", { path: "/" });
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const res = await authAPI.getMe();
      setUser(res.data);
    } catch {
      Cookies.remove("token", { path: "/" });
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (t: string, u: User) => {
    Cookies.set("token", t, COOKIE_OPTS);
    setToken(t);
    setUser(u);
  };

  const logout = () => {
    Cookies.remove("token", { path: "/" });
    setToken(null);
    setUser(null);
    if (typeof window !== "undefined") window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{
      user, token, loading, login, logout, refreshUser: fetchUser,
      isAdmin: user?.role === Role.ADMIN,
      isPlayer: user?.role === Role.PLAYER,
      isHirer: user?.role === Role.HIRER,
      isVerified: !!(user?.emailVerified || user?.phoneVerified),
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);