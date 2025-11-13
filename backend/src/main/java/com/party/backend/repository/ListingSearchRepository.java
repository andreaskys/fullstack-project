package com.party.backend.repository;

import com.party.backend.document.ListingDocument;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ListingSearchRepository extends ElasticsearchRepository<ListingDocument, Long> {

    List<ListingDocument> findByTitleOrDescription(String title, String description);

    List<ListingDocument> findByLocationAndPriceLessThan(String location, BigDecimal price);
}