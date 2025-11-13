package com.party.backend.repository;

import com.party.backend.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

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

}
