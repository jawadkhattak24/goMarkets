import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
interface AuthContextType {
  isLoggedIn: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  currentUser: User | null;
}

export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType
);

export function useAuth() {
  return useContext(AuthContext);
}

interface User {
  verificationStatus: "UNVERIFIED" | "AUDITING" | "VERIFIED";
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  password: string;
  availableFunds: number;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  function login(user: User, token: string) {
    localStorage.setItem("token", token);
    setIsLoggedIn(true);
    setCurrentUser(user);
    console.log("User logged in: ", user);
  }

  const logout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem("token");
  };

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        const response = await axios.get(
          "https://go-markets-api.vercel.app/api/user/me",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCurrentUser(response.data.user);
      }
    };
    fetchUser();
  }, []);

  const value = {
    isLoggedIn,
    login,
    logout,
    currentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
