package com.party.backend.dto.listing;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ListingResponseDTO {

    private Long id;
    private String title;
    private String description;
    private String location;
    private BigDecimal price;
    private Double rating;
    private Integer maxGuests;
    private String hostName;
    private List<String> imageUrls;
    private List<String> amenities;
    private List<String> videoUrls;
    private Long hostId;
}
