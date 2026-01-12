-- Add reverted_from_version_id column to track which version a revert was based on
-- This enables the UI to show "Reverted from Version X" indicators

ALTER TABLE prompt_versions
ADD COLUMN reverted_from_version_id UUID REFERENCES prompt_versions(id) ON DELETE SET NULL;

-- Add index for query performance when filtering by revert source
CREATE INDEX idx_prompt_versions_reverted_from
ON prompt_versions(reverted_from_version_id)
WHERE reverted_from_version_id IS NOT NULL;

COMMENT ON COLUMN prompt_versions.reverted_from_version_id IS 'UUID of the version this snapshot was reverted to (null for regular edits)';
