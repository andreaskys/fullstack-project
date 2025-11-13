CREATE TABLE listing (
                         id BIGSERIAL PRIMARY KEY,
                         host_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                         title VARCHAR(255) NOT NULL,
                         description TEXT,
                         location TEXT,
                         price DECIMAL(10, 2) NOT NULL,
                         rating NUMERIC(3, 2) DEFAULT 0.00,
                         max_guests INT NOT NULL,
                         enabled BOOLEAN DEFAULT true,
                         created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_listing_host_id ON listing(host_id);