package com.party.backend.controller;

import com.party.backend.dto.ChatMessageDTO;
import com.party.backend.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.party.backend.model.User;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.List;

@Controller
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    @MessageMapping("/{roomId}")
    @SendTo("/topic/{roomId}")
    public ChatMessageDTO sendMessage(
            @Payload ChatMessageDTO chatMessage,
            @DestinationVariable String roomId
    ) {
        Long bookingId = Long.parseLong(roomId);
        chatService.saveMessage(chatMessage, bookingId);
        return chatMessage;
    }

    @GetMapping("/{bookingId}")
    public ResponseEntity<List<ChatMessageDTO>> getChatHistory(
            @PathVariable Long bookingId,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(chatService.getMessageHistory(bookingId, currentUser));
    }
}