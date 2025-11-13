package com.party.backend.dto.booking;

import com.party.backend.model.enums.BookingStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class BookingResponseDTO {

    private Long id;
    private LocalDate checkinDate;
    private LocalDate checkoutDate;
    private BigDecimal totalPrice;
    private BookingStatus status;

    private Long userId;
    private String userName;

    private Long listingId;
    private String listingTitle;
}
