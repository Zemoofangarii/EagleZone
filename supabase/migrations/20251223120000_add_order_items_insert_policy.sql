-- Allow authenticated customers to add items to their own orders
CREATE POLICY "Users can insert own order items"
ON public.order_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_id AND o.user_id = auth.uid()
  )
);

