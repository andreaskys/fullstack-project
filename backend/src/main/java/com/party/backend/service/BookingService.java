package com.party.backend.service;

import com.party.backend.dto.booking.BookingRequestDTO;
import com.party.backend.dto.booking.BookingResponseDTO;
import com.party.backend.exception.ResourceNotFoundException;
import com.party.backend.model.Booking;
import com.party.backend.model.Listing;
import com.party.backend.model.User;
import com.party.backend.model.enums.BookingStatus;
import com.party.backend.repository.BookingRepository;
import com.party.backend.repository.ListingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.party.backend.exception.BookingConflictException;
import com.party.backend.exception.UnauthorizedOperationException;
import com.party.backend.dto.NotificationDTO;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ListingRepository listingRepository;
    private final NotificationService notificationService;

    @Transactional
    public BookingResponseDTO createBooking(BookingRequestDTO request, User client) {
        Listing listing = listingRepository.findById(request.getListingId())
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found with id: " + request.getListingId()));
        if (request.getCheckInDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("A data de Check-in não pode ser no passado.");
        }
        if (!request.getCheckOutDate().isAfter(request.getCheckInDate())) {
            throw new IllegalArgumentException("A data de Check-out deve ser posterior à data de Check-in.");
        }
        if (listing.getHost().getId().equals(client.getId())) {
            throw new BookingConflictException("O dono não pode reservar o seu próprio espaço.");
        }
        List<Booking> overlappingBookings = bookingRepository.findOverlappingBookings(
                request.getListingId(),
                request.getCheckInDate(),
                request.getCheckOutDate()
        );
        if (!overlappingBookings.isEmpty()) {
            throw new BookingConflictException("As datas selecionadas já não estão disponíveis.");
        }
        long numberOfDays = ChronoUnit.DAYS.between(request.getCheckInDate(), request.getCheckOutDate());
        BigDecimal totalPrice = listing.getPrice().multiply(new BigDecimal(numberOfDays));

        Booking booking = new Booking();
        booking.setUser(client);
        booking.setListing(listing);
        booking.setCheckInDate(request.getCheckInDate());
        booking.setCheckOutDate(request.getCheckOutDate());
        booking.setTotalPrice(totalPrice);
        booking.setStatus(BookingStatus.PENDING);

        Booking savedBooking = bookingRepository.save(booking);

        User host = listing.getHost();
        if (!client.getId().equals(host.getId())) {
            log.info(" Sending booking notification to host: {} for listing: {}",
                    host.getUsername(), listing.getTitle());

            NotificationDTO notification = new NotificationDTO(
                    "Nova Reserva feita por " + client.getFirstName() + " para " + listing.getTitle(),
                    "/my-listings"
            );
            notificationService.sendNotificationToUser(host, notification);
        } else {
            log.warn("Skipping notification: Client and Host are the same user");
        }

        return mapToBookingResponse(savedBooking);
    }

    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getBookingsForCurrentUser(User client) {
        return bookingRepository.findByUserId(client.getId())
                .stream()
                .map(this::mapToBookingResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getBookingsForListing(Long listingId, User currentUser) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found with id: " + listingId));
        if (!listing.getHost().getId().equals(currentUser.getId())) {
            throw new UnauthorizedOperationException("Utilizador não tem permissão para ver as reservas deste espaço.");
        }
        return bookingRepository.findByListingId(listingId).stream()
                .map(this::mapToBookingResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteBooking(Long bookingId, User currentUser) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Reserva não encontrada com id: " + bookingId));
        User host = booking.getListing().getHost();
        User client = booking.getUser();
        Long currentUserId = currentUser.getId();
        if (!currentUserId.equals(client.getId()) && !currentUserId.equals(host.getId())) {
            throw new UnauthorizedOperationException("Você não tem permissão para cancelar esta reserva.");
        }
        if (booking.getStatus() == BookingStatus.CONFIRMED &&
                booking.getCheckInDate().isBefore(LocalDate.now())) {
            throw new BookingConflictException("Não é possível cancelar uma reserva que já começou.");
        }
        log.info("🗑️ Deleting booking id: {} by user: {}", bookingId, currentUser.getUsername());
        User notificationRecipient = currentUserId.equals(client.getId()) ? host : client;
        String cancelledBy = currentUserId.equals(client.getId()) ? client.getFirstName() : "o anfitrião";
        NotificationDTO notification = new NotificationDTO(
                "Reserva cancelada por " + cancelledBy + " para " + booking.getListing().getTitle(),
                currentUserId.equals(client.getId()) ? "/my-listings" : "/my-bookings"
        );
        notificationService.sendNotificationToUser(notificationRecipient, notification);
        bookingRepository.delete(booking);
        log.info("✅ Booking deleted successfully");
    }


    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getBookingsForHost(User host) {
        List<Booking> bookings = bookingRepository.findAllByListingHostId(host.getId());
        return bookings.stream()
                .map(this::mapToBookingResponse)
                .collect(Collectors.toList());
    }

    private BookingResponseDTO mapToBookingResponse(Booking booking) {
        BookingResponseDTO response = new BookingResponseDTO();
        response.setId(booking.getId());
        response.setCheckinDate(booking.getCheckInDate());
        response.setCheckoutDate(booking.getCheckOutDate());
        response.setTotalPrice(booking.getTotalPrice());
        response.setStatus(booking.getStatus());

        response.setUserId(booking.getUser().getId());
        response.setUserName(booking.getUser().getFirstName());

        response.setListingId(booking.getListing().getId());
        response.setListingTitle(booking.getListing().getTitle());

        return response;
    }




}
