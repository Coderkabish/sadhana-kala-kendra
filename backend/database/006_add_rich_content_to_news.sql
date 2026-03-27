-- Migration: Add rich_content field to News table for rich text content
-- This allows storing formatted HTML content for news articles

ALTER TABLE News ADD COLUMN rich_content LONGTEXT NULL AFTER content;

-- Create an index on news_date for better query performance
ALTER TABLE News ADD INDEX idx_news_date (news_date);
