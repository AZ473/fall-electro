
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS is_popular boolean NOT NULL DEFAULT false;

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_flash_sale boolean NOT NULL DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS flash_sale_ends_at timestamptz;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS rating numeric(3,2) NOT NULL DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sold_count integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_categories_popular ON public.categories(is_popular) WHERE is_popular;
CREATE INDEX IF NOT EXISTS idx_products_flash ON public.products(is_flash_sale) WHERE is_flash_sale;

DELETE FROM public.categories WHERE slug = 'bbbb';
