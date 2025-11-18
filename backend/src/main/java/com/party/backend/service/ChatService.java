package com.party.backend.service;

import com.party.backend.dto.ChatMessageDTO;
import com.party.backend.dto.NotificationDTO;
import com.party.backend.exception.ResourceNotFoundException;
import com.party.backend.exception.UnauthorizedOperationException;
import com.party.backend.model.Booking;
import com.party.backend.model.ChatMessage;
import com.party.backend.model.User;
import com.party.backend.repository.BookingRepository;
import com.party.backend.repository.ChatMessageRepository;
import com.party.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public ChatMessage saveMessage(ChatMessageDTO chatMessageDTO, Long bookingId) {
        Booking booking = bookingRepository.findByIdWithDetails(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Reserva não encontrada: " + bookingId));

        User sender = userRepository.findById(chatMessageDTO.getSenderId())
                .orElseThrow(() -> new ResourceNotFoundException("Utilizador remetente não encontrado: " + chatMessageDTO.getSenderId()));
        ChatMessage message = new ChatMessage();
        message.setBooking(booking);
        message.setSender(sender);
        message.setContent(chatMessageDTO.getContent());

        User host = booking.getListing().getHost();
        User client = booking.getUser();
        User recipient = sender.getId().equals(client.getId()) ? host : client;

        log.info("Sending chat notification from {} to {}",
                sender.getFirstName(), recipient.getFirstName());

        NotificationDTO notification = new NotificationDTO(
                "Nova mensagem de " + sender.getFirstName(),
                "/chat/" + bookingId
        );
        notificationService.sendNotificationToUser(recipient, notification);

        return chatMessageRepository.save(message);
    }

    @Transactional(readOnly = true)
    public List<ChatMessageDTO> getMessageHistory(Long bookingId, User currentUser) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Reserva não encontrada: " + bookingId));
        Long currentUserId = currentUser.getId();
        Long clientId = booking.getUser().getId();
        Long hostId = booking.getListing().getHost().getId();
        if (!currentUserId.equals(clientId) && !currentUserId.equals(hostId)) {
            throw new UnauthorizedOperationException("Você não tem permissão para aceder a este chat.");
        }

        List<ChatMessage> messages = chatMessageRepository.findByBookingIdOrderByTimestampAsc(bookingId);

        return messages.stream()
                .map(message -> new ChatMessageDTO(
                        message.getSender().getFirstName(),
                        message.getSender().getId(),
                        message.getContent()
                ))
                .collect(Collectors.toList());
    }
}