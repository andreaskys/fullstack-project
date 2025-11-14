package com.party.backend.controller;

import com.party.backend.dto.booking.BookingResponseDTO;
import com.party.backend.dto.booking.BookingRequestDTO;
import com.party.backend.model.User;
import com.party.backend.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<BookingResponseDTO> createBooking(
            @Valid @RequestBody BookingRequestDTO request,
            @AuthenticationPrincipal User currentUser
    ) {
        BookingResponseDTO response = bookingService.createBooking(request, currentUser);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/my-bookings")
    public ResponseEntity<List<BookingResponseDTO>> getMyBookings(
            @AuthenticationPrincipal User currentUser
    ) {
        List<BookingResponseDTO> bookings = bookingService.getBookingsForCurrentUser(currentUser);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/as-host")
    public ResponseEntity<List<BookingResponseDTO>> getBookingsAsHost(
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(bookingService.getBookingsForHost(currentUser));
    }

    // TODO: Adicionar endpoints para o host ver as reservas do seu espaço (GET /api/listings/{id}/bookings)
}