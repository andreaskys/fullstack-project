package com.party.backend.repository;

import com.party.backend.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserId(Long userId);

    List<Booking> findByListingId(Long listingId);

    List<Booking> findByListingIdAndStatus(Long listingId, String status);

    @Query("SELECT b FROM Booking b WHERE b.listing.id = :listingId " +
            "AND b.status != 'CANCELLED' " +
            "AND b.checkInDate < :checkOutDate " +
            "AND b.checkOutDate > :checkInDate")
    List<Booking> findOverlappingBookings(
            @Param("listingId") Long listingId,
            @Param("checkInDate") LocalDate checkInDate,
            @Param("checkOutDate") LocalDate checkOutDate
    );

    @Modifying
    @Query(value = "DELETE FROM booking WHERE listing_id = :listingId", nativeQuery = true)
    void deleteByListingId(@Param("listingId") Long listingId);

    interface BookingSummaryProjection {
        Long getId();
        Long getListingId();
        String getClientName();
        LocalDate getCheckInDate();
        LocalDate getCheckOutDate();
        String getStatus();
    }

    @Query("SELECT b.id as id, b.listing.id as listingId, b.user.firstName as clientName, " +
            "b.checkInDate as checkInDate, b.checkOutDate as checkOutDate, b.status as status " +
            "FROM Booking b WHERE b.listing.id IN :listingIds")
    List<BookingSummaryProjection> findSummariesByListingIds(@Param("listingIds") Set<Long> listingIds);

    @Query("SELECT b FROM Booking b " +
            "JOIN FETCH b.listing l " +
            "JOIN FETCH b.user " +
            "WHERE l.host.id = :hostId " +
            "ORDER BY b.checkInDate DESC")
    List<Booking> findAllByListingHostId(@Param("hostId") Long hostId);

    @Query("SELECT b FROM Booking b " +
            "JOIN FETCH b.user " +
            "JOIN FETCH b.listing l " +
            "JOIN FETCH l.host " +
            "WHERE b.id = :bookingId")
    Optional<Booking> findByIdWithDetails(@Param("bookingId") Long bookingId);

    @Query("SELECT DISTINCT b FROM Booking b " +
            "JOIN FETCH b.user u " +
            "JOIN FETCH b.listing l " +
            "JOIN FETCH l.host h " +
            "WHERE u.id = :userId OR h.id = :userId " +
            "ORDER BY b.checkInDate DESC")
    List<Booking> findConversationsForUser(@Param("userId") Long userId);
}
