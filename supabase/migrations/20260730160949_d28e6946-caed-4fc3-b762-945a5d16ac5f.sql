DROP POLICY IF EXISTS "Guests create guest orders" ON public.orders;
DROP POLICY IF EXISTS "Guests insert items in guest orders" ON public.order_items;
REVOKE INSERT ON public.orders FROM anon;
REVOKE INSERT ON public.order_items FROM anon;

DELETE FROM public.orders WHERE customer_name = 'T' AND customer_phone = '77';

CREATE OR REPLACE FUNCTION public.place_order(
  p_customer_name text,
  p_customer_phone text,
  p_shipping_city text,
  p_shipping_address text,
  p_items jsonb,
  p_customer_email text DEFAULT NULL,
  p_notes text DEFAULT NULL,
  p_payment_method public.payment_method DEFAULT 'wave'
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id uuid;
  v_order_number text;
  v_subtotal numeric := 0;
  v_item jsonb;
  v_product public.products%ROWTYPE;
  v_qty int;
BEGIN
  IF coalesce(trim(p_customer_name), '') = '' OR coalesce(trim(p_customer_phone), '') = ''
     OR coalesce(trim(p_shipping_address), '') = '' THEN
    RAISE EXCEPTION 'Informations client incomplètes';
  END IF;

  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 OR jsonb_array_length(p_items) > 50 THEN
    RAISE EXCEPTION 'Panier invalide';
  END IF;

  INSERT INTO public.orders (
    user_id, customer_name, customer_phone, customer_email,
    shipping_city, shipping_address, notes, payment_method,
    subtotal, shipping_fee, total_amount
  ) VALUES (
    auth.uid(), trim(p_customer_name), trim(p_customer_phone), nullif(trim(coalesce(p_customer_email,'')), ''),
    trim(p_shipping_city), trim(p_shipping_address), nullif(trim(coalesce(p_notes,'')), ''), p_payment_method,
    0, 0, 0
  )
  RETURNING id, order_number INTO v_order_id, v_order_number;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT * INTO v_product FROM public.products
      WHERE id = (v_item->>'product_id')::uuid AND is_active = true;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Produit indisponible';
    END IF;

    v_qty := greatest(1, least(coalesce((v_item->>'quantity')::int, 1), 99));

    INSERT INTO public.order_items (
      order_id, product_id, product_name, product_image, quantity, unit_price, total_price
    ) VALUES (
      v_order_id, v_product.id, v_product.name,
      (SELECT image_url FROM public.product_images
        WHERE product_id = v_product.id ORDER BY is_primary DESC LIMIT 1),
      v_qty, v_product.price, v_product.price * v_qty
    );

    v_subtotal := v_subtotal + v_product.price * v_qty;
  END LOOP;

  UPDATE public.orders
    SET subtotal = v_subtotal, total_amount = v_subtotal + shipping_fee
    WHERE id = v_order_id;

  RETURN v_order_number;
END;
$$;

REVOKE ALL ON FUNCTION public.place_order(text, text, text, text, jsonb, text, text, public.payment_method) FROM public;
GRANT EXECUTE ON FUNCTION public.place_order(text, text, text, text, jsonb, text, text, public.payment_method) TO anon, authenticated;