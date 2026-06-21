-- Catalyst capture fields. Optional X handle and self-reported X tier
-- (starting / growing / established). Both nullable: signup never requires
-- them, so an empty handle/tier can never block a valid email.

ALTER TABLE waitlist ADD COLUMN x_handle TEXT;
ALTER TABLE waitlist ADD COLUMN tier TEXT;
