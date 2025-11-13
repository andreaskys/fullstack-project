package com.party.backend.dto.listing;

import lombok.Data;

import java.math.BigDecimal;
import java.util.Set;

@Data
public class ListingRequestDTO {

    private String title;
    private String description;
    private String location;
    private BigDecimal price;
    private Integer maxGuests;
    private Set<Integer> amenityIds;

}
