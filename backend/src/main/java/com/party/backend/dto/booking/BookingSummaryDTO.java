package com.party.backend.dto.booking;

import lombok.Data;
import java.time.LocalDate;

@Data
public class BookingSummaryDTO {
    private Long id;
    private String clientName;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private String status;
}