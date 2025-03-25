"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import ChatMessage from "./ChatMessage";

const Chat = () => {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [alert, setAlert] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const messagesRef = collection(db, "messages");
        const q = query(messagesRef, orderBy("timestamp", "asc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const showAlert = (message, type = "error") => {
        setAlert({ message, type });
        setTimeout(() => setAlert(null), 3000); 
    };

    const sendMessage = async (e) => {
        e.preventDefault();

        if (!text.trim()) {
            showAlert("Message cannot be empty!", "error");
            return;
        }

        if (!user || !user.uid) {
            showAlert("You are not logged in! Redirecting to login...", "warning");
            setTimeout(() => router.push("/login"), 3000); 
            return;
        }

        try {
            await addDoc(collection(db, "messages"), {
                text,
                timestamp: serverTimestamp(),
                uid: user.uid,
                displayName: user.displayName || "Anonymous",
            });

            setText(""); 
        } catch (error) {
            showAlert("Error sending message. Try again!", "error");
        }
    };

    return (
        <div className="flex flex-col h-screen w-full bg-green-100">
            {/* Alert Box */}
            {alert && (
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                    className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg text-white ${
                        alert.type === "error" ? "bg-red-500" : "bg-yellow-500"
                    }`}
                >
                    {alert.message}
                </motion.div>
            )}

            {/* Header */}
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="flex justify-between items-center p-4 bg-[#075E54] text-white shadow-md"
            >
                <h2 className="text-xl font-bold">Chat App</h2>
                <button
                    onClick={() => logout.mutate?.()}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition"
                >
                    Logout
                </button>
            </motion.div>

            {/* Chat Messages Container */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="flex-1 overflow-y-auto p-4 space-y-4 bg-cover"
            >
                {messages.length === 0 ? (
                    <p className="text-center text-gray-500">No messages yet. Start the conversation!</p>
                ) : (
                    messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <ChatMessage message={msg} currentUser={user} />
                        </motion.div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </motion.div>

            {/* Message Input */}
            <motion.form
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                onSubmit={sendMessage}
                className="p-4 bg-white flex items-center gap-2 shadow-md"
            >
                <input
                    type="text"
                    className="flex-1 p-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type a message..."
                />
                <button
                    type="submit"
                    className="px-6 py-3 bg-[#25D366] text-white rounded-full shadow-md hover:bg-green-600 transition"
                >
                    Send 🚀
                </button>
            </motion.form>
        </div>
    );
};

export default Chat;
