-- Migration: Remove content field from News table
-- The rich_content field now handles all formatted content

ALTER TABLE News DROP COLUMN content;
