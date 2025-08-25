import React, { useContext, useEffect, useState, useRef } from "react";
import assets from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";

const Sidebar = () => {
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
  } = useContext(ChatContext);

  const { logout, onlineUsers } = useContext(AuthContext);

  const [input, setInput] = useState(""); // ✅ search input
  const [open, setOpen] = useState(false); // ✅ dropdown state
  const menuRef = useRef(); // ✅ ref for outside click

  const navigate = useNavigate();

  const filteredUsers = input
    ? users.filter((user) =>
        user.fullName.toLowerCase().includes(input.toLowerCase())
      )
    : users;

  useEffect(() => {
    getUsers();
  }, [onlineUsers]);

  // Close dropdown on ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className={`bg-[#8185B2]/10 h-full p-5 rounded-r-xl overflow-y-auto text-white transition-all duration-300 ${
        selectedUser ? "max-md:hidden" : ""
      }`}
    >
      <div className="pb-5 border-b border-gray-700/40">
        <div className="flex justify-between items-center">
          <img src={assets.logo} alt="logo" className="max-w-36" />

          {/* ✅ Dropdown menu */}
          <div className="relative py-2" ref={menuRef}>
            <img
              src={assets.menu_icon}
              alt="Menu"
              className="max-h-5 cursor-pointer hover:opacity-80 transition"
              onClick={() => setOpen((prev) => !prev)}
            />

            {open && (
              <div className="absolute top-full right-0 z-20 w-36 p-3 rounded-md bg-[#282142] border border-gray-600 text-gray-100 shadow-lg">
                <p
                  onClick={() => {
                    navigate("/profile");
                    setOpen(false);
                  }}
                  className="cursor-pointer hover:text-violet-400 transition"
                >
                  Edit Profile
                </p>
                <hr className="my-2 border-gray-500" />
                <p
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                  className="cursor-pointer text-sm hover:text-red-400 transition"
                >
                  Logout
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#282142] rounded-full flex items-center gap-2 py-2 px-4 mt-5 focus-within:ring-2 focus-within:ring-violet-500">
          <img
            src={assets.search_icon}
            alt="Search"
            className="w-4 opacity-80"
          />
          <input
            onChange={(e) => setInput(e.target.value)}
            type="text"
            className="bg-transparent border-none outline-none text-white text-sm placeholder-[#c8c8c8] flex-1"
            placeholder="Search User..."
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-5">
        {Array.isArray(filteredUsers) && filteredUsers.length > 0 ? (
          filteredUsers.map((user, index) => (
            <div
              key={user._id || index}
              onClick={() => {
                setSelectedUser(user);
                setUnseenMessages((prev) => ({
                  ...prev,
                  [user._id]: 0,
                }));
              }}
              className={`relative flex items-center gap-3 p-2 pl-4 rounded-lg cursor-pointer transition ${
                selectedUser?._id === user._id
                  ? "bg-[#282142]/70 shadow-inner"
                  : "hover:bg-[#282142]/30"
              }`}
            >
              {/* avatar */}
              <img
                src={user.profilePic || assets.avatar_icon}
                alt={user.fullName}
                className="w-10 h-10 rounded-full object-cover"
              />

              {/* name + last message */}
              <div className="flex flex-col">
                <p className="font-semibold text-white">{user.fullName}</p>
                <p className="text-sm text-gray-400 truncate">
                  {user.lastMessage}
                </p>
              </div>

              {/* unseen messages badge */}
              {unseenMessages[user._id] > 0 && (
                <span className="absolute right-2 top-2 bg-red-500 text-white text-xs rounded-full px-2">
                  {unseenMessages[user._id]}
                </span>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-center mt-4">No users found</p>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
