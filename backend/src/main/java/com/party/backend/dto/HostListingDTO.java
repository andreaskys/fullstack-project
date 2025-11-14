package com.party.backend.dto;

import com.party.backend.dto.booking.BookingSummaryDTO;
import lombok.Data;
import java.util.List;

@Data
public class HostListingDTO {
    private Long id;
    private String title;
    private String imageUrl;
    private List<BookingSummaryDTO> bookings;
}