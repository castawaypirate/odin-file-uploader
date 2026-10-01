CREATE OR REPLACE FUNCTION get_folder_path(folder_id TEXT)
RETURNS TABLE (id TEXT, name TEXT)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE path AS (
    SELECT fo.id, fo.name, fo.parent_folder_id
    FROM folders fo
    WHERE fo.id = folder_id
    UNION
    SELECT f.id, f.name, f.parent_folder_id
    FROM folders f
    INNER JOIN path p ON p.parent_folder_id = f.id)
    SELECT pa.id, pa.name FROM path pa;
END;
$$;
