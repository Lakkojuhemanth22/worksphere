import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import io from "socket.io-client";

const VideoCall = () => {
    const location = useLocation();
    const roomId = new URLSearchParams(location.search).get("roomId");
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const newSocket = io("http://localhost:5000", {
            transports: ["websocket", "polling"],
            withCredentials: true,
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 2000
        });

        newSocket.on("connect", () => {
            console.log("✅ Connected to signaling server:", newSocket.id);
            newSocket.emit("join-room", { roomId, userId: newSocket.id });

            // Send a test message after connecting
            newSocket.emit("message", "Hello from the client!");
        });

        newSocket.on("connect_error", (error) => {
            console.error("❌ WebSocket connection error:", error.message);
        });

        newSocket.on("disconnect", (reason) => {
            console.warn(`⚠️ WebSocket disconnected: ${reason}`);
        });

        newSocket.on("message", (data) => {
            console.log("📩 Received message:", data);
        });

        newSocket.on("reconnect_attempt", (attemptNumber) => {
            console.log(`🔄 Attempting to reconnect (attempt #${attemptNumber})...`);
        });
        
        newSocket.on("reconnect", (attemptNumber) => {
            console.log(`✅ Successfully reconnected after ${attemptNumber} attempts.`);
        });
        
        newSocket.on("reconnect_error", (error) => {
            console.error("❌ Reconnection error:", error);
        });
        
        newSocket.on("reconnect_failed", () => {
            console.error("❌ Reconnection failed.");
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [roomId]);

    return (
        <div>
            <h1>Video Call</h1>
            <p>Room ID: {roomId}</p>
        </div>
    );
};

export default VideoCall;