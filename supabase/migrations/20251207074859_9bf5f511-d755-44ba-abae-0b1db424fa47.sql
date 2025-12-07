-- Create storage bucket for product and category images
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to view images
CREATE POLICY "Anyone can view images"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

-- Allow staff to upload images
CREATE POLICY "Staff can upload images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'images' AND is_staff());

-- Allow staff to update images
CREATE POLICY "Staff can update images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'images' AND is_staff());

-- Allow staff to delete images
CREATE POLICY "Staff can delete images"
ON storage.objects FOR DELETE
USING (bucket_id = 'images' AND is_staff());