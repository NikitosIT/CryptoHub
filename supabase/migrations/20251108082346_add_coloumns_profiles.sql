ALTER TABLE profiles
ADD COLUMN two_factor_enabled boolean DEFAULT false,
ADD COLUMN two_factor_secret text;
