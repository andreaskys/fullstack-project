package com.party.backend.service;


import com.party.backend.dto.NotificationDTO;
import com.party.backend.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public void sendNotificationToUser(User user, NotificationDTO notification){
        messagingTemplate.convertAndSendToUser(
                user.getUsername(),
                "/topic/notification",
                notification
        );
    }
}
