package com.party.backend.controller;

import com.party.backend.dto.booking.BookingResponseDTO;
import com.party.backend.dto.listing.ListingRequestDTO;
import com.party.backend.dto.listing.ListingResponseDTO;
import com.party.backend.model.User;
import com.party.backend.service.ListingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.party.backend.service.BookingService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/listings")
@RequiredArgsConstructor
public class ListingController {

    private final ListingService listingService;
    private final BookingService bookingService;

    @GetMapping
    public ResponseEntity<List<ListingResponseDTO>> getAllListings() {
        return ResponseEntity.ok(listingService.getAllListings());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ListingResponseDTO> getListingById(@PathVariable Long id) {
        return ResponseEntity.ok(listingService.getListingById(id));
    }

    @PostMapping
    public ResponseEntity<ListingResponseDTO> createListing(@RequestBody ListingRequestDTO request, @AuthenticationPrincipal User currentUser) {
        ListingResponseDTO response = listingService.createListing(request, currentUser);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ListingResponseDTO> updateListing(
            @PathVariable Long id,
            @RequestBody ListingRequestDTO request,
            @AuthenticationPrincipal User currentUser
    ) {
        ListingResponseDTO response = listingService.updateListing(id, request, currentUser);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteListing(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        listingService.deleteListing(id, currentUser);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PostMapping("/{id}/images")
    public ResponseEntity<?> uploadImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User currentUser
    ) {
        String imageUrl = listingService.addImageToListing(id, file, currentUser);
        return new ResponseEntity<>(Map.of("imageUrl", imageUrl), HttpStatus.CREATED);
    }

    @PostMapping("/{id}/videos")
    public ResponseEntity<?> uploadVideo(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User currentUser
    ) {
        String videoUrl = listingService.addVideoToListing(id, file, currentUser);
        return new ResponseEntity<>(Map.of("videoUrl", videoUrl), HttpStatus.CREATED);
    }

    @GetMapping("/{listingId}/bookings")
    public ResponseEntity<List<BookingResponseDTO>> getBookingsForListing(
            @PathVariable Long listingId,
            @AuthenticationPrincipal User currentUser
    ){
        List<BookingResponseDTO> bookings = bookingService.getBookingsForListing(listingId, currentUser);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/search")
    public ResponseEntity<List<ListingResponseDTO>> searchListings(
            @RequestParam("query") String query
    ) {
        return ResponseEntity.ok(listingService.searchListings(query));
    }


}
