CREATE TABLE listing_image (
                               id BIGSERIAL PRIMARY KEY,
                               listing_id BIGINT NOT NULL REFERENCES listing(id) ON DELETE CASCADE,
                               image_url TEXT NOT NULL,
                               is_cover BOOLEAN DEFAULT false
);

CREATE INDEX idx_listing_image_listing_id ON listing_image(listing_id);