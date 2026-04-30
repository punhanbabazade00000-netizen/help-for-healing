
-- Lock down search_path and execute permissions on SECURITY DEFINER functions
ALTER FUNCTION public.update_updated_at() SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at() FROM PUBLIC, anon, authenticated;

-- Replace broad SELECT on patient-photos bucket with no listing (public URL access still works)
DROP POLICY IF EXISTS "Patient photos are publicly viewable" ON storage.objects;
-- (Public bucket: files served by direct URL via the storage CDN. We do not need an SELECT policy for that.)
