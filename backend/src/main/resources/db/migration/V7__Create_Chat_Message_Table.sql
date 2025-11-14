CREATE TABLE chat_message (
                              id BIGSERIAL PRIMARY KEY,

                              booking_id BIGINT NOT NULL REFERENCES booking(id) ON DELETE CASCADE,

                              sender_id BIGINT REFERENCES users(id) ON DELETE SET NULL,

                              content TEXT NOT NULL,

                              timestamp TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_message_booking_id ON chat_message(booking_id);
CREATE INDEX idx_chat_message_sender_id ON chat_message(sender_id);