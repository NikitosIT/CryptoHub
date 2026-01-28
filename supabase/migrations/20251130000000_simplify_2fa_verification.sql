-- Add new boolean column for 2FA verification status
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_2fa_verified BOOLEAN DEFAULT false;

-- Set default value for existing rows
UPDATE profiles
SET is_2fa_verified = false
WHERE is_2fa_verified IS NULL;

-- Make column NOT NULL
ALTER TABLE profiles
ALTER COLUMN is_2fa_verified SET NOT NULL;

-- Drop the old timestamp column
ALTER TABLE profiles
DROP COLUMN IF EXISTS two_factor_verified_until;

