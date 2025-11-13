package com.party.backend.repository;

import com.party.backend.model.ListingImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface ListingImageRepository extends JpaRepository<ListingImage, Long> {

    @Query("SELECT i.imageUrl FROM ListingImage i WHERE i.listing.id = :listingId")
    List<String> findUrlsByListingId(Long listingId);

    @Modifying
    @Query(value = "DELETE FROM listing_image WHERE listing_id = :listingId", nativeQuery = true)
    void deleteByListingId(@Param("listingId") Long listingId);

    interface CoverImageProjection {
        Long getListingId();
        String getImageUrl();
    }

    @Query(value = "SELECT DISTINCT ON (listing_id) " +
            "listing_id as listingId, image_url as imageUrl " +
            "FROM listing_image " +
            "WHERE listing_id IN :listingIds AND is_cover = true", nativeQuery = true)
    List<CoverImageProjection> findCoverImagesForListingIds(@Param("listingIds") Set<Long> listingIds);

    List<ListingImage> findAllByListingIdOrderByIsCoverDesc(Long listingId);
}
