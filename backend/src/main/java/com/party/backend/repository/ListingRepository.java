package com.party.backend.repository;

import com.party.backend.model.Listing;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

import java.util.List;

@Repository
public interface ListingRepository extends JpaRepository<Listing, Long> {

    List<Listing> findByHostId(Long hostId);

    @Query("SELECT DISTINCT l FROM Listing l " +
            "LEFT JOIN FETCH l.host " +
            "LEFT JOIN FETCH l.images " +
            "LEFT JOIN FETCH l.videos " +
            "LEFT JOIN FETCH l.amenities " +
            "WHERE l.id = :id")
    Optional<Listing> findByIdWithDetails(@Param("id") Long id);

    @Query("SELECT DISTINCT l FROM Listing l " +
            "LEFT JOIN FETCH l.host " +
            "LEFT JOIN FETCH l.images")
    List<Listing> findAllWithImages();

    @Override
    List<Listing> findAll();

    @Override
    Optional<Listing> findById(Long id);


    @Modifying
    @Query(value = "DELETE FROM listing_amenity WHERE listing_id = :listingId", nativeQuery = true)
    void deleteAmenitiesByListingId(@Param("listingId") Long listingId);

    /*@Query("SELECT DISTINCT l FROM Listing l " +
            "LEFT JOIN FETCH l.bookings b " +
            "LEFT JOIN FETCH b.user " +
            "LEFT JOIN FETCH l.images i " +
            "WHERE l.host.id = :hostId AND (i.isCover = true OR l.images IS EMPTY)")
    List<Listing> findHostListingsWithBookings(@Param("hostId") Long hostId);*/

}