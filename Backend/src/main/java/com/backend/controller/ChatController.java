package com.backend.controller;

import com.backend.entity.ChatMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import java.time.LocalDateTime;

@Controller
public class ChatController {

    @MessageMapping("/chat")
    @SendTo("/topic/messages") // Sends response to all subscribers
    public String sendMessage(String message) {
        System.out.println("📩 Received from frontend: " + message);
        return "Server says: " + message;
    }
}
