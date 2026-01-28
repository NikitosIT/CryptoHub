-- Create table to track email resend timestamps
CREATE TABLE IF NOT EXISTS email_resend_tracking (
    email TEXT PRIMARY KEY,
    last_sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_resend_tracking_last_sent_at ON email_resend_tracking(last_sent_at);

-- Enable RLS
ALTER TABLE email_resend_tracking ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert/update (for tracking)
CREATE POLICY "Allow anonymous insert and update on email_resend_tracking"
    ON email_resend_tracking
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Allow anonymous users to select (for checking status)
CREATE POLICY "Allow anonymous select on email_resend_tracking"
    ON email_resend_tracking
    FOR SELECT
    USING (true);

