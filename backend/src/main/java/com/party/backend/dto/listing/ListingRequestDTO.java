package com.party.backend.dto.listing;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

@Data
public class ListingRequestDTO {

    @NotBlank(message = "O título é obrigatório")
    private String title;

    @NotBlank(message = "A descrição é obrigatória")
    private String description;

    @NotBlank(message = "A localização é obrigatória")
    private String location;

    @NotNull(message = "O preço é obrigatório")
    @Min(value = 0, message = "O preço não pode ser negativo")
    private BigDecimal price;

    @NotNull(message = "O número máximo de hóspedes é obrigatório")
    @Min(value = 1, message = "O número máximo de hóspedes deve ser pelo menos 1")
    private Integer maxGuests;

    private Set<Integer> amenityIds;

    private List<String> imageUrls;
    private List<String> videoUrls;

}
