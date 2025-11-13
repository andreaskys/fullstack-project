CREATE TABLE booking (
                         id BIGSERIAL PRIMARY KEY,
                         user_id BIGINT NOT NULL REFERENCES users(id),
                         listing_id BIGINT NOT NULL REFERENCES listing(id),
                         check_in_date DATE NOT NULL,
                         check_out_date DATE NOT NULL,
                         total_price DECIMAL(10, 2) NOT NULL,
                         status VARCHAR(50) DEFAULT 'PENDING',
                         created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,

                         CONSTRAINT chk_dates CHECK (check_out_date > check_in_date)
);

CREATE INDEX idx_booking_user_id ON booking(user_id);
CREATE INDEX idx_booking_listing_id ON booking(listing_id);