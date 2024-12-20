-- Add Replicate fields to models table
ALTER TABLE models
ADD COLUMN replicate_model_id VARCHAR(255),
ADD COLUMN replicate_version_id VARCHAR(255);

-- Add index for faster lookups
CREATE INDEX idx_replicate_model_id ON models(replicate_model_id);

-- Add check constraint for type
ALTER TABLE models
DROP CONSTRAINT IF EXISTS models_type_check,
ADD CONSTRAINT models_type_check 
CHECK (type IN ('man', 'woman')); 