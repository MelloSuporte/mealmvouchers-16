-- Drop existing function if it exists
DROP FUNCTION IF EXISTS count_estimate;

-- Recreate function with explicit search_path
CREATE OR REPLACE FUNCTION count_estimate(query text)
RETURNS INTEGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    rec   record;
    ROWS  INTEGER;
BEGIN
    FOR rec IN EXECUTE 'EXPLAIN ' || query LOOP
        ROWS := SUBSTRING(rec."QUERY PLAN" FROM ' rows=([[:digit:]]+)');
        EXIT WHEN ROWS IS NOT NULL;
    END LOOP;
 
    RETURN ROWS;
END;
$$;

-- Set proper permissions
REVOKE ALL ON FUNCTION count_estimate(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION count_estimate(text) TO authenticated;

-- Add documentation
COMMENT ON FUNCTION count_estimate IS 'Estimates the number of rows that would be returned by a query without executing it';