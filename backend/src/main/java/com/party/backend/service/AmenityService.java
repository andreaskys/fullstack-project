package com.party.backend.service;

import com.party.backend.dto.AmenityDTO;
import com.party.backend.repository.AmenityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AmenityService {

    private final AmenityRepository amenityRepository;

    @Transactional(readOnly = true)
    public List<AmenityDTO> getAllAmenities() {
        return amenityRepository.findAll().stream()
                .map(amenity -> new AmenityDTO(amenity.getId(), amenity.getName()))
                .collect(Collectors.toList());
    }
}