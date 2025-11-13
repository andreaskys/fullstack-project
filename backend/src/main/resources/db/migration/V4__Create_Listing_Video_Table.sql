CREATE TABLE listing_video (
                               id BIGSERIAL PRIMARY KEY,
                               listing_id BIGINT NOT NULL REFERENCES listing(id) ON DELETE CASCADE,
                               video_url TEXT NOT NULL,
                               thumbnail_url TEXT
);

CREATE INDEX idx_listing_video_listing_id ON listing_video(listing_id);