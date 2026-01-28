-- Remove unused function: set_updated_at
-- This function is defined but never used in any trigger
DROP FUNCTION IF EXISTS public.set_updated_at();

