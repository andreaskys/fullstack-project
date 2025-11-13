package com.party.backend.repository;


import com.party.backend.model.Amenity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface AmenityRepository extends JpaRepository<Amenity, Integer> {

    interface AmenityProjection {
        Long getListingId();
        String getAmenityName();
    }

    @Query(value = "SELECT la.listing_id as listingId, a.name as amenityName " +
            "FROM listing_amenity la JOIN amenity a ON la.amenity_id = a.id " +
            "WHERE la.listing_id IN :listingIds", nativeQuery = true)
    List<AmenityProjection> findAmenitiesForListingIds(@Param("listingIds") Set<Long> listingIds);
}

