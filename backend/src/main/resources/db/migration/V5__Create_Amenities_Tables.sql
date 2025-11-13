CREATE TABLE amenity (
                         id SERIAL PRIMARY KEY,
                         name VARCHAR(100) NOT NULL UNIQUE,
                         icon_svg TEXT
);

CREATE TABLE listing_amenity (
                                 listing_id BIGINT NOT NULL REFERENCES listing(id) ON DELETE CASCADE,
                                 amenity_id INT NOT NULL REFERENCES amenity(id) ON DELETE CASCADE,
                                 PRIMARY KEY (listing_id, amenity_id)
);