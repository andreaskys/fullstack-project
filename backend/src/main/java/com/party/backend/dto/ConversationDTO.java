package com.party.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConversationDTO {
    private Long bookingId;
    private String listingTitle;
    private String listingLocation;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private String otherUserName;
    private String status;

    // Campos opcionais para o futuro (chat)
    private LocalDateTime lastMessageTime;
    private Integer unreadCount;
}