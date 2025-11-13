package com.party.backend.dto.booking;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class BookingRequestDTO {

    @NotNull(message = "O ID do listing é obrigatório")
    private Long listingId;

    @NotNull(message = "A data de Check-in é obrigatória")
    private LocalDate checkInDate;

    @NotNull(message = "A data de Check-out é obrigatória")
    private LocalDate checkOutDate;
}
