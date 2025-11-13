package com.party.backend.repository;

import com.party.backend.model.ListingVideo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

@Repository
public interface ListingVideoRepository extends JpaRepository<ListingVideo, Long> {

    @Query("SELECT v.videoUrl FROM ListingVideo v WHERE v.listing.id = :listingId")
    List<String> findUrlsByListingId(Long listingId);

    @Modifying
    @Query(value = "DELETE FROM listing_video WHERE listing_id = :listingId", nativeQuery = true)
    void deleteByListingId(@Param("listingId") Long listingId);
}