package com.party.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@NamedEntityGraph(
        name = "Listing.withHostImagesAndAmenities",
        attributeNodes = {
                @NamedAttributeNode("host"),
                @NamedAttributeNode("images"),
                @NamedAttributeNode("amenities")
        }
)
@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = {"images", "videos", "amenities", "bookings"})
@Entity
@Table(name="listing")
public class Listing {

    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String description;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private BigDecimal price;

    private double rating;

    @Column(name="max_guests", nullable = false)
    private Integer maxGuests;

    private boolean enabled;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "host_id", nullable = false)
    private User host;

    @OneToMany(mappedBy = "listing", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ListingImage> images = new HashSet<>();

    @OneToMany(mappedBy = "listing", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ListingVideo> videos = new HashSet<>();

    @ManyToMany
    @JoinTable(
            name = "listing_amenity",
            joinColumns = @JoinColumn(name = "listing_id"),
            inverseJoinColumns = @JoinColumn(name = "amenity_id")
    )
    private Set<Amenity> amenities = new HashSet<>();

    @OneToMany(
            mappedBy = "listing",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private Set<Booking> bookings = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        enabled = true;
        rating = 0.0;
    }
}
