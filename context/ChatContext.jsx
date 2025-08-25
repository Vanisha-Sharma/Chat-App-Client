import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;
axios.defaults.withCredentials = true; // ✅ send cookies/jwt

// ✅ attach token automatically (if stored in localStorage)
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});
  const [users, setUsers] = useState([]);

  // connect socket
  useEffect(() => {
    const newSocket = io(backendUrl, {
      query: { userId: localStorage.getItem("userId") },
    });
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // ✅ fetch all users
  const getUsers = async () => {
    try {
      const res = await axios.get("/api/users");
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching users", err);
      setUsers([]);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  // ✅ fetch messages of selected user
  const getMessages = async (userId) => {
    if (!userId) return;
    try {
      const res = await axios.get(`/api/messages/${userId}`);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error("Error fetching messages", err);
    }
  };

  // fetch messages whenever selectedUser changes
  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
      setUnseenMessages((prev) => ({ ...prev, [selectedUser._id]: 0 }));
    }
  }, [selectedUser]);

  // socket listener
  useEffect(() => {
    if (!socket) return;

    socket.on("newMessage", (msg) => {
      if (msg.senderId === selectedUser?._id) {
        setMessages((prev) => [...prev, msg]);
      } else {
        setUnseenMessages((prev) => ({
          ...prev,
          [msg.senderId]: (prev[msg.senderId] || 0) + 1,
        }));
      }
    });

    return () => {
      socket.off("newMessage");
    };
  }, [socket, selectedUser]);

  // ✅ send message
  const sendMessage = async ({ text, image }) => {
    if (!selectedUser) return;

    try {
      const res = await axios.post(`/api/messages/send/${selectedUser._id}`, {
        text,
        image,
      });

      if (res.data?.newMessage) {
        setMessages((prev) => [...prev, res.data.newMessage]);
        socket.emit("sendMessage", res.data.newMessage);
      }
    } catch (err) {
      console.error("Error sending message", err);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        users,
        getUsers,
        selectedUser,
        setSelectedUser,
        messages,
        setMessages,
        getMessages,
        sendMessage,
        unseenMessages,
        setUnseenMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
