-- Create storage bucket for reports
INSERT INTO storage.buckets (id, name, public)
VALUES ('relatorios', 'relatorios', true);

-- Create storage policy to allow authenticated users to upload their own reports
CREATE POLICY "Users can upload their own reports"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'relatorios' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create storage policy to allow users to read their own reports
CREATE POLICY "Users can read their own reports"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'relatorios' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create storage policy to allow users to delete their own reports
CREATE POLICY "Users can delete their own reports"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'relatorios' AND
  (storage.foldername(name))[1] = auth.uid()::text
); 