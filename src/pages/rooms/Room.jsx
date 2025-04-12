import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaPhoneAlt, FaUserFriends, FaBars, FaPaperPlane } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import SockJS from "sockjs-client";
import * as Stomp from "stompjs";
import "./Room.css";

const Room = () => {
    const location = useLocation();
    const roomId = location.state?.roomId;
    const [users, setUsers] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState("");

    const userName = localStorage.getItem("userName");
    const userId = localStorage.getItem("employeeId"); // Make sure it's correct
    console.log("userId:", userId);
    const token = localStorage.getItem("token");

    const stompClientRef = useRef(null); // 🔥 Persist WebSocket connection

    useEffect(() => {
        fetchUsersInRoom();
        console.log("🔥 Messages Updated:", messages);
        connectToChat();
        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.disconnect();
            }
        };
    }, [roomId], [messages]);

    // Fetch users in the room
    const fetchUsersInRoom = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/employee/rooms/${roomId}/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error.response?.data || error.message);
        }
    };

    // Connect to WebSocket
    const connectToChat = () => {
        if (!userId) {
            console.error("❌ userId is missing! Cannot connect to chat.");
            return;
        }
    
        console.log(`✅ Connecting to WebSocket for room ${roomId}`);
    
        const socket = new SockJS("http://localhost:8080/ws");
        const stompClient = Stomp.over(socket);
        stompClient.connect({}, () => {
            console.log("✅ WebSocket connected!");
    
            // 🔥 Subscribe to the correct topic
            stompClient.subscribe(`/topic/room.${roomId}`, (message) => {
                const receivedMessage = JSON.parse(message.body);
            
                setMessages((prevMessages) => {
                    // ✅ Avoid duplicate messages
                    if (!prevMessages.find(msg => msg.id === receivedMessage.id)) {
                        return [...prevMessages, receivedMessage];
                    }
                    return prevMessages;
                });
            });                               
    
            // Announce user has joined
            stompClient.send(
                "/app/chat.addUser",
                {},
                JSON.stringify({ sender: userId, type: "JOIN", roomId })
            );
    
            stompClientRef.current = stompClient; // Persist connection
        });
    };    

    // Send Chat Message
    const sendMessage = () => {
        if (messageInput.trim() === "" || !stompClientRef.current) {
            console.error("❌ Cannot send message. Either input is empty or WebSocket is not connected.");
            return;
        }

        console.log(`📤 Sending message: ${messageInput} from ${userId}`);

        const chatMessage = {
            sender: userId, // ✅ Ensure userId is correct
            content: messageInput,
            type: "CHAT",
            roomId, // ✅ Ensure roomId is included
        };

        stompClientRef.current.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
        setMessageInput(""); // Clear input after sending
    };

    return (
        <div className="room-container">
            {/* Sidebar (User List) */}
            <div className={`room-sidebar ${isSidebarOpen ? "open" : "closed"}`}>
                <div className="sidebar-header">
                    <h3>Participants</h3>
                    <button className="toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                        <FaBars />
                    </button>
                </div>
                <ul className="user-list">
                    {users.length > 0 ? (
                        users.map((user) => (
                            <li key={user.id} className="user-item">
                                <img src={`https://i.pravatar.cc/40?u=${user.id}`} alt={user.name} className="user-avatar" />
                                <span>{user.name}</span>
                            </li>
                        ))
                    ) : (
                        <p className="no-users">No users in this room</p>
                    )}
                </ul>
            </div>

            {/* Main Content */}
            <div className="room-main">
                {/* Navbar */}
                <div className="room-navbar">
                    <div className="room-title">
                        <h2>Room {roomId}</h2>
                    </div>
                    <div className="room-actions">
                        <button className="start-call-btn" onClick={() => window.location.href = "/videocall.html"}>
                            <FaPhoneAlt /> Start Call
                        </button>
                        <div className="user-profile">
                            <img src="https://i.pravatar.cc/40" alt="User Avatar" className="user-avatar" />
                            <span className="user-name">{userName}</span>
                        </div>
                    </div>
                </div>

                {/* Room Content */}
                <div className="room-content">
                    <h3>Welcome to Room {roomId}</h3>
                    <p>Start a call or collaborate with your team.</p>
                </div>

                {/* Chat Box */}
                <div className="chat-container">
                    <div className="chat-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`chat-message ${msg.sender === userId ? "own-message" : "other-message"}`}>
                                <span className="message-sender">{msg.sender}</span>
                                <span>{msg.content}</span>
                                <span className="message-time">{new Date().toLocaleTimeString()}</span>
                            </div>
                        ))}
                    </div>
                    <div className="chat-input">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        />
                        <button onClick={sendMessage} className="send-btn">
                            <FaPaperPlane />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Room;
