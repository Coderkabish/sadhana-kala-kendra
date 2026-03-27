-- Migration: Add details_content field to BOD table for rich text content
-- This allows storing formatted HTML content for BOD member details

ALTER TABLE BOD ADD COLUMN details_content LONGTEXT NULL AFTER bio;

-- Create an index on updated_at for better query performance
ALTER TABLE BOD ADD INDEX idx_bod_updated_at (updated_at);
