package com.party.backend.service;

import com.party.backend.document.ListingDocument;
import com.party.backend.dto.listing.ListingRequestDTO;
import com.party.backend.dto.listing.ListingResponseDTO;
import com.party.backend.exception.UnauthorizedOperationException;
import com.party.backend.model.*;
import com.party.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.party.backend.exception.ResourceNotFoundException;
import org.springframework.web.multipart.MultipartFile;
import com.party.backend.model.Amenity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.party.backend.model.ListingVideo;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.query.Query;
import org.springframework.data.elasticsearch.core.query.StringQuery;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ListingService {

    private final ListingRepository listingRepository;
    private final AmenityRepository amenityRepository;
    private final StorageService storageService;
    private final ListingImageRepository listingImageRepository;
    private final ListingVideoRepository listingVideoRepository;
    private final BookingRepository bookingRepository;
    private final ListingSearchRepository listingSearchRepository;
    private final ElasticsearchOperations elasticsearchOperations;
    private final UserRepository userRepository;
    private static final Logger logger = LoggerFactory.getLogger(ListingService.class);

    private static final long MAX_PHOTO_SIZE_MB = 10;
    private static final long MAX_PHOTO_SIZE_BYTES = MAX_PHOTO_SIZE_MB * 1024 * 1024;

    @Transactional(readOnly = true)
    public List<ListingResponseDTO> getAllListings() {
        logger.info("Buscando todos os listings (método otimizado N+1 manual)...");
        List<Listing> listings = listingRepository.findAll();
        if (listings.isEmpty()) {
            return List.of();
        }
        Set<Long> listingIds = listings.stream().map(Listing::getId).collect(Collectors.toSet());
        Set<Long> hostIds = listings.stream().map(l -> l.getHost().getId()).collect(Collectors.toSet());
        Map<Long, User> hostsById = userRepository.findAllById(hostIds).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));
        Map<Long, String> coverImageByListingId = listingImageRepository.findCoverImagesForListingIds(listingIds)
                .stream()
                .collect(Collectors.toMap(
                        ListingImageRepository.CoverImageProjection::getListingId,
                        ListingImageRepository.CoverImageProjection::getImageUrl,
                        (existing, replacement) -> existing
                ));
        Map<Long, List<String>> amenitiesByListingId = new HashMap<>();
        amenityRepository.findAmenitiesForListingIds(listingIds)
                .forEach(projection -> {
                    amenitiesByListingId
                            .computeIfAbsent(projection.getListingId(), k -> new ArrayList<>())
                            .add(projection.getAmenityName());
                });
        return listings.stream().map(listing -> {
            ListingResponseDTO response = new ListingResponseDTO();
            response.setId(listing.getId());
            response.setTitle(listing.getTitle());
            response.setLocation(listing.getLocation());
            response.setDescription(listing.getDescription());
            response.setPrice(listing.getPrice());
            response.setRating(listing.getRating());
            response.setMaxGuests(listing.getMaxGuests());

            User host = hostsById.get(listing.getHost().getId());
            if (host != null) {
                response.setHostName(host.getFirstName());
                response.setHostId(host.getId());
            }

            String coverUrl = coverImageByListingId.get(listing.getId());
            response.setImageUrls(coverUrl != null ? List.of(coverUrl) : List.of());

            response.setAmenities(amenitiesByListingId.getOrDefault(listing.getId(), List.of()));

            response.setVideoUrls(List.of());

            return response;
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ListingResponseDTO getListingById(Long listingId) {
        logger.info("Buscando Listing por ID (Método Manual): {}", listingId);
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found with id: " + listingId));
        List<String> imageUrls = listingImageRepository.findAllByListingIdOrderByIsCoverDesc(listingId)
                .stream()
                .map(ListingImage::getImageUrl)
                .collect(Collectors.toList());
        List<String> videoUrls = listingVideoRepository.findUrlsByListingId(listingId);
        List<String> amenityNames = amenityRepository.findAmenitiesForListingIds(Set.of(listingId))
                .stream()
                .map(AmenityRepository.AmenityProjection::getAmenityName)
                .sorted()
                .collect(Collectors.toList());
        return mapToListingResponse(listing, imageUrls, videoUrls, amenityNames);
    }

    @Transactional
    public ListingResponseDTO createListing(ListingRequestDTO request, User host){
        Set<Amenity> amenities = new HashSet<>(amenityRepository.findAllById(request.getAmenityIds()));
        Listing listing = new Listing();
        listing.setTitle(request.getTitle());
        listing.setDescription(request.getDescription());
        listing.setLocation(request.getLocation());
        listing.setPrice(request.getPrice());
        listing.setMaxGuests(request.getMaxGuests());
        listing.setAmenities(amenities);
        listing.setHost(host);
        Listing savedListing = listingRepository.save(listing);
        listingSearchRepository.save(mapToListingDocument(savedListing));
        return mapToListingResponse(savedListing);
    }

    @Transactional
    public ListingResponseDTO updateListing(Long listingId, ListingRequestDTO request, User currentUser) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found with id: " + listingId));
        if (!listing.getHost().getId().equals(currentUser.getId())) {
            throw new UnauthorizedOperationException("User does not have permission to update this listing");
        }
        listing.setTitle(request.getTitle());
        listing.setDescription(request.getDescription());
        listing.setLocation(request.getLocation());
        listing.setPrice(request.getPrice());
        listing.setMaxGuests(request.getMaxGuests());
        if (request.getAmenityIds() != null) {
            Set<Amenity> amenities = new HashSet<>(amenityRepository.findAllById(request.getAmenityIds()));
            listing.setAmenities(amenities);
        }
        Listing updatedListing = listingRepository.save(listing);
        listingSearchRepository.save(mapToListingDocument(updatedListing));
        return mapToListingResponse(updatedListing);
    }

    @Transactional
    public void deleteListing(Long listingId, User currentUser) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found with id: " + listingId));

        if (!listing.getHost().getId().equals(currentUser.getId())) {
            throw new UnauthorizedOperationException("User does not have permission to delete this listing");
        }
        List<String> imageUrls = listingImageRepository.findUrlsByListingId(listingId);
        for (String url : imageUrls) {
            storageService.deleteFile(url);
        }
        List<String> videoUrls = listingVideoRepository.findUrlsByListingId(listingId);
        for (String url : videoUrls) {
            storageService.deleteFile(url);
        }

        listingSearchRepository.deleteById(listingId);

        listingImageRepository.deleteByListingId(listingId);
        listingVideoRepository.deleteByListingId(listingId);
        bookingRepository.deleteByListingId(listingId);
        listingRepository.deleteAmenitiesByListingId(listingId);
        listingRepository.delete(listing);
    }

    @Transactional
    public String addImageToListing(Long listingId, MultipartFile file, User currentUser) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found with id: " + listingId));
        if (!listing.getHost().getId().equals(currentUser.getId())) {
            throw new UnauthorizedOperationException("User does not have permission to add images to this listing");
        }
        if (file.isEmpty()) {
            throw new IllegalArgumentException("O ficheiro não pode estar vazio.");
        }
        if (file.getSize() > MAX_PHOTO_SIZE_BYTES) {
            throw new IllegalArgumentException("O ficheiro excede o limite de " + MAX_PHOTO_SIZE_MB + "MB para fotos.");
        }
        String imageUrl = storageService.uploadFile(file);
        ListingImage listingImage = new ListingImage();
        listingImage.setListing(listing);
        listingImage.setImageUrl(imageUrl);
        List<String> existingImages = listingImageRepository.findUrlsByListingId(listingId);
        if (existingImages.isEmpty()) {
            listingImage.setCover(true);
        }
        listingImageRepository.save(listingImage);
        return imageUrl;
    }

    @Transactional
    public String addVideoToListing(Long listingId, MultipartFile file, User currentUser) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found with id: " + listingId));
        if (!listing.getHost().getId().equals(currentUser.getId())) {
            throw new UnauthorizedOperationException("User does not have permission to add videos to this listing");
        }
        String videoUrl = storageService.uploadFile(file);
        ListingVideo listingVideo = new ListingVideo();
        listingVideo.setListing(listing);
        listingVideo.setVideoUrl(videoUrl);
        // TODO: Adicionar lógica para extrair um thumbnail (capa) do vídeo (v2.0)
        listingVideoRepository.save(listingVideo);
        return videoUrl;
    }

    @Transactional(readOnly = true)
    public List<ListingResponseDTO> searchListings(String query) {

        String jsonQuery = """
        {
            "bool": {
                "must": [
                    {
                        "multi_match": {
                            "query": "%s",
                            "fields": ["title", "description", "location"],
                            "fuzziness": "AUTO"
                        }
                    }
                ]
            }
        }
        """.formatted(query);
        Query searchQuery = new StringQuery(jsonQuery);
        SearchHits<ListingDocument> searchHits = elasticsearchOperations.search(
                searchQuery,
                ListingDocument.class
        );
        return searchHits.getSearchHits().stream()
                .map(hit -> mapDocumentToResponse(hit.getContent()))
                .collect(Collectors.toList());
    }

    private ListingResponseDTO mapToListingResponse(Listing listing, List<String> imageUrls, List<String> videoUrls, List<String> amenityNames) {
        logger.info("Mapeando Listing ID: {} (Método Manual)", listing.getId());

        ListingResponseDTO response = new ListingResponseDTO();
        response.setId(listing.getId());
        response.setTitle(listing.getTitle());
        response.setDescription(listing.getDescription());
        response.setLocation(listing.getLocation());
        response.setPrice(listing.getPrice());
        response.setRating(listing.getRating());
        response.setMaxGuests(listing.getMaxGuests());

        if (listing.getHost() != null) {
            response.setHostName(listing.getHost().getFirstName());
            response.setHostId(listing.getHost().getId());
        }

        response.setImageUrls(imageUrls != null ? imageUrls : List.of());
        response.setAmenities(amenityNames != null ? amenityNames : List.of());
        response.setVideoUrls(videoUrls != null ? videoUrls : List.of());

        return response;
    }


    private ListingResponseDTO mapToListingResponse(Listing listing) {

        logger.info("Mapeando Listing ID: {}", listing.getId());

        ListingResponseDTO response = new ListingResponseDTO();
        response.setId(listing.getId());
        response.setTitle(listing.getTitle());
        response.setDescription(listing.getDescription());
        response.setLocation(listing.getLocation());
        response.setPrice(listing.getPrice());
        response.setRating(listing.getRating());
        response.setMaxGuests(listing.getMaxGuests());

        if (listing.getHost() != null) {
            response.setHostName(listing.getHost().getFirstName());
            response.setHostId(listing.getHost().getId());
        }

        if (listing.getImages() != null && !listing.getImages().isEmpty()) {
            List<String> sortedImageUrls = listing.getImages().stream()
                    .sorted(Comparator.comparing(ListingImage::isCover).reversed())
                    .map(ListingImage::getImageUrl)
                    .collect(Collectors.toList());
            response.setImageUrls(sortedImageUrls);
        } else {
            response.setImageUrls(List.of());
        }

        if (listing.getAmenities() != null) {
            List<String> amenityNames = listing.getAmenities().stream()
                    .map(Amenity::getName)
                    .sorted()
                    .collect(Collectors.toList());
            response.setAmenities(amenityNames);
        }

        if (listing.getVideos() != null) {
            List<String> videoUrls = listing.getVideos().stream()
                    .map(ListingVideo::getVideoUrl)
                    .collect(Collectors.toList());
            response.setVideoUrls(videoUrls);
        }
        return response;
    }

    private ListingDocument mapToListingDocument(Listing listing) {
        ListingDocument doc = new ListingDocument();
        doc.setId(listing.getId());
        doc.setTitle(listing.getTitle());
        doc.setDescription(listing.getDescription());
        doc.setLocation(listing.getLocation());
        doc.setPrice(listing.getPrice());
        doc.setMaxGuests(listing.getMaxGuests());
        if (listing.getAmenities() != null) {
            List<String> amenityNames = listing.getAmenities().stream()
                    .map(Amenity::getName)
                    .collect(Collectors.toList());
            doc.setAmenities(amenityNames);
        }

        return doc;
    }

    private ListingResponseDTO mapDocumentToResponse(ListingDocument doc) {
        ListingResponseDTO response = new ListingResponseDTO();
        response.setId(doc.getId());
        response.setTitle(doc.getTitle());
        response.setDescription(doc.getDescription());
        response.setLocation(doc.getLocation());
        response.setPrice(doc.getPrice());
        response.setMaxGuests(doc.getMaxGuests());
        response.setAmenities(doc.getAmenities());

        return response;
    }
}