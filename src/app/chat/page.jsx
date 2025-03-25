"use client";

import Chat from "../../components/Chat";
import { useAuth } from "../../contexts/AuthContext";
import Login from "../page";

const ChatPage = () => {
  const { user } = useAuth();

  return <div>{user ? <Chat /> : <Login />}</div>;
};

export default ChatPage;

