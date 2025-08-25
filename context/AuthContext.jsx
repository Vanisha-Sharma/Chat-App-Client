import { createContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

// ✅ Backend URL from .env
const backendUrl = import.meta.env.VITE_BACKEND_URL;

// ✅ Create axios instance
const api = axios.create({
  baseURL: backendUrl,
  withCredentials: true,
});

// ✅ Create Context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [users, setUsers] = useState([]); // ✅ store all users

  // ✅ Normalize user
  const normalizeUser = (user) => {
    if (!user) return null;
    return {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      bio: user.bio || "",
      profilePic: user.profilePic || "",
    };
  };

  // ✅ Check authentication
  const checkAuth = async () => {
    try {
      const { data } = await api.get("/api/auth/check");
      if (data.success) {
        const user = normalizeUser(data.user);
        setAuthUser(user);
        connectSocket(user);
      } else {
        logout();
      }
    } catch (error) {
      console.error(error.message);
      toast.error("Auth check failed");
      logout();
    }
  };

  // ✅ Login / Signup
  const login = async (state, credentials) => {
    try {
      const { data } = await api.post(`/api/auth/${state}`, credentials);
      if (data.success) {
        const user = normalizeUser(data.userData);
        setAuthUser(user);
        setToken(data.token);
        localStorage.setItem("token", data.token);
        api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
        connectSocket(user);
        toast.success(data.message);
      } else {
        toast.error(data.message || "Authentication failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // ✅ Logout
  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setAuthUser(null);
    setOnlineUsers([]);
    setUsers([]);
    delete api.defaults.headers.common["Authorization"];
    if (socket) socket.disconnect();
    setSocket(null);
    toast.success("Logged out successfully");
  };

  // ✅ Update profile
  const updateProfile = async (body) => {
    try {
      const { data } = await api.put("/api/auth/update-profile", body);
      if (data.success) {
        const user = normalizeUser(data.user);
        setAuthUser(user);
        toast.success("Profile updated successfully");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // ✅ Get all users
  const getUsers = async () => {
    try {
      const { data } = await api.get("/api/users");
      if (data) {
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error.message);
      toast.error("Failed to fetch users");
    }
  };

  // ✅ Connect socket.io
  const connectSocket = (userData) => {
    if (!userData?._id || socket?.connected) return;

    const newSocket = io(backendUrl, {
      query: { userId: userData._id },
    });

    setSocket(newSocket);

    newSocket.on("getOnlineUsers", (onlineList) => {
      setOnlineUsers(onlineList);
    });

    return () => newSocket.off("getOnlineUsers");
  };

  // ✅ Run on mount / token change
  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      checkAuth();
    }
    return () => {
      if (socket) socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        api,
        authUser,
        onlineUsers,
        socket,
        users,
        getUsers,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
