import { createContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

// Create an axios instance with baseURL
const api = axios.create({
  baseURL: backendUrl,
  withCredentials: true, // optional, if you need cookies
});

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  // Normalize user (optional utility to avoid undefined fields)
  const normalizeUser = (user) => {
    if (!user) return null;
    return {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      bio: user.bio || "",
    };
  };

  // Check authentication
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
      toast.error(error.message);
      logout();
    }
  };

  // Login / Signup
  const login = async (state, credentials) => {
    try {
      const { data } = await api.post(`/api/auth/${state}`, credentials);
      if (data.success) {
        const user = normalizeUser(data.userData);
        setAuthUser(user);
        connectSocket(user);

        setToken(data.token);
        localStorage.setItem("token", data.token);

        toast.success(data.message);
      } else {
        toast.error(data.message || "Authentication failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);
    delete api.defaults.headers.common["Authorization"];
    socket?.disconnect();
    setSocket(null);
    toast.success("Logged out successfully");
  };

  // Update profile
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

  // Connect socket
  const connectSocket = (userData) => {
    if (!userData?._id || socket?.connected) return;

    const newSocket = io(backendUrl, {
      query: { userId: userData._id },
    });

    setSocket(newSocket);

    newSocket.on("getOnlineUsers", (userId) => {
      setOnlineUsers(userId);
    });

    return () => newSocket.off("getOnlineUsers");
  };

  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      checkAuth();
    }
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        api, // ✅ provide the axios instance
        authUser,
        onlineUsers,
        socket,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
