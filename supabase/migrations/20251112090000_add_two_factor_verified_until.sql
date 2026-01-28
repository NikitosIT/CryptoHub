ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS two_factor_verified_until timestamptz;

