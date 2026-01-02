-- Step 1: Create batch_sources table
CREATE TABLE IF NOT EXISTS batch_sources (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    batch_id UUID NOT NULL REFERENCES order_batches (id) ON UPDATE CASCADE ON DELETE CASCADE,
    source_id VARCHAR(255) NOT NULL,
    source_name VARCHAR(255) NOT NULL,
    source_type VARCHAR(20) NOT NULL CHECK (
        source_type IN ('room', 'table', 'facility')
    ),
    total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Step 2: Add indexes to batch_sources
CREATE INDEX IF NOT EXISTS idx_batch_sources_batch_id ON batch_sources (batch_id);

CREATE INDEX IF NOT EXISTS idx_batch_sources_source_type ON batch_sources (source_type);

CREATE INDEX IF NOT EXISTS idx_batch_sources_source_id ON batch_sources (source_id);

-- Step 3: Add batch_source_id column to restaurant_orders
ALTER TABLE restaurant_orders
ADD COLUMN IF NOT EXISTS batch_source_id UUID REFERENCES batch_sources (id) ON UPDATE CASCADE ON DELETE SET NULL;

-- Step 4: Add index for batch_source_id
CREATE INDEX IF NOT EXISTS idx_restaurant_orders_batch_source_id ON restaurant_orders (batch_source_id);

-- Step 5: Verify the tables
SELECT table_name
FROM information_schema.tables
WHERE
    table_schema = 'public'
    AND table_name IN (
        'batch_sources',
        'restaurant_orders'
    );

-- Step 6: Verify columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE
    table_name = 'batch_sources'
ORDER BY ordinal_position;

SELECT column_name, data_type
FROM information_schema.columns
WHERE
    table_name = 'restaurant_orders'
    AND column_name = 'batch_source_id';