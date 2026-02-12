import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  plan: string;
  accountStatus: string;
  resourceAccess: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    name: string,
    email: string,
    password: string,
    role?: string,
  ) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  getDashboardPath: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = Cookies.get("token");

    if (token) {
      try {
        const response = await axios.get("/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data.user);
      } catch (error) {
        console.error("Auth check failed:", error);
        Cookies.remove("token");
      }
    }

    setLoading(false);
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post("/api/auth/login", {
        email,
        password,
      });

      const { token, user } = response.data;
      Cookies.set("token", token, { expires: 7 });
      setUser(user);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
  };

  const getDashboardPath = () => {
    if (!user) return "/login";
    switch (user.role) {
      case "admin":
        return "/admin/dashboard";
      case "teacher":
        return "/teacher/dashboard";
      default:
        return "/dashboard";
    }
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    role?: string,
  ) => {
    try {
      const response = await axios.post("/api/auth/signup", {
        name,
        email,
        password,
        role: role || "student",
      });

      const { token, user } = response.data;
      Cookies.set("token", token, { expires: 7 });
      setUser(user);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Signup failed");
    }
  };

  const logout = () => {
    Cookies.remove("token");
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("resource_timer_start");
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
        getDashboardPath,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
