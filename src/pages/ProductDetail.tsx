import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Minus, Plus, ShoppingCart, Heart, ArrowLeft } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { ProductCard } from "@/components/products/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import type { Product, ProductImage } from "@/types/database";
import { Helmet } from "react-helmet-async";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { motion, AnimatePresence } from "framer-motion";
import { FadeUp, imageReveal } from "@/components/animations/MotionWrappers";
import { useTranslation } from "react-i18next";

export default function ProductDetail() {
  const { t } = useTranslation();
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function fetchProduct() {
      if (!slug) return;

      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          product_images (*),
          product_variants (*)
        `)
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();

      if (error || !data) {
        navigate("/products");
        return;
      }

      const productData = data as unknown as Product;
      setProduct(productData);
      setLoading(false);

      // Fetch related products from same categories
      const { data: categoryLinks } = await supabase
        .from("product_categories")
        .select("category_id")
        .eq("product_id", productData.id);

      if (categoryLinks && categoryLinks.length > 0) {
        const categoryIds = categoryLinks.map((c) => c.category_id);
        const { data: relatedLinks } = await supabase
          .from("product_categories")
          .select("product_id")
          .in("category_id", categoryIds)
          .neq("product_id", productData.id);

        if (relatedLinks && relatedLinks.length > 0) {
          const uniqueIds = [...new Set(relatedLinks.map((r) => r.product_id))];
          const { data: relatedData } = await supabase
            .from("products")
            .select("*, product_images (*), product_categories (category_id, categories (id, name, slug))")
            .in("id", uniqueIds)
            .eq("published", true)
            .limit(12);

          if (relatedData) {
            type RelatedRow = (typeof relatedData)[number] & {
              product_categories?: { category_id: string; categories: { id: string; name: string; slug: string } | null }[];
            };
            const mapped = (relatedData as RelatedRow[]).map((p) => ({
              ...p,
              categories: p.product_categories?.map((pc) => pc.categories).filter(Boolean),
            }));
            setRelatedProducts(mapped as unknown as Product[]);
          }
        }
      }
    }

    fetchProduct();
    setRelatedProducts([]);
  }, [slug, navigate]);

  async function handleAddToCart() {
    if (!product) return;
    setIsAddingToCart(true);
    await addToCart(product.id, quantity);
    setIsAddingToCart(false);
    setQuantity(1);
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="container py-8 md:py-12">
          <div className="grid lg:grid-cols-2 gap-12 animate-pulse">
            <div className="aspect-square bg-muted rounded-lg" />
            <div className="space-y-6">
              <div className="h-8 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="h-6 bg-muted rounded w-1/4" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!product) return null;

  const images = product.images || product.product_images || [];
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;

  return (
    <MainLayout>
      <Helmet>
        <title>{product.seo_title || product.title} - High Mirror</title>
        <meta name="description" content={product.seo_description || product.short_description || ""} />
        <meta property="og:title" content={product.seo_title || product.title} />
        <meta property="og:description" content={product.seo_description || product.short_description || ""} />
        <meta property="og:type" content="product" />
        {images[0]?.url && <meta property="og:image" content={images[0].url} />}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.title,
            description: product.description,
            image: images.map((img: ProductImage) => img.url),
            offers: {
              "@type": "Offer",
              price: product.price,
              priceCurrency: product.currency || "USD",
              availability: "https://schema.org/InStock",
            },
          })}
        </script>
      </Helmet>

      <div className="container py-8 md:py-12">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate("/products")}
          >
            <ArrowLeft className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
            {t("product.backToProducts")}
          </Button>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Images */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
          >
            <div className="aspect-square rounded-lg overflow-hidden bg-card border border-border">
              <AnimatePresence mode="wait">
                {images.length > 0 ? (
                  <motion.img
                    key={selectedImage}
                    src={images[selectedImage]?.url}
                    alt={images[selectedImage]?.alt_text || product.title}
                    className="w-full h-full object-cover"
                    variants={imageReveal}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.3 } }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <span className="text-muted-foreground">No image</span>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img: ProductImage, idx: number) => (
                  <motion.button
                    key={img.id}
                    onClick={() => setSelectedImage(idx)}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === idx
                        ? "border-primary"
                        : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={img.alt_text || `${product.title} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Details */}
          <div className="space-y-6">
            <FadeUp delay={0.2}>
              <div>
                <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
                  {product.title}
                </h1>
                {product.short_description && (
                  <p className="text-muted-foreground">{product.short_description}</p>
                )}
              </div>
            </FadeUp>

            {/* Price */}
            <FadeUp delay={0.3}>
              <div className="flex items-center gap-4">
                <motion.span
                  className="text-3xl font-bold"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.4 }}
                >
                  ${product.price.toFixed(2)}
                </motion.span>
                {hasDiscount && (
                  <>
                    <span className="text-xl text-muted-foreground line-through">
                      ${product.compare_at_price!.toFixed(2)}
                    </span>
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 12, delay: 0.5 }}
                      className="bg-destructive text-destructive-foreground text-sm font-bold px-2 py-1 rounded"
                    >
                      Save ${(product.compare_at_price! - product.price).toFixed(2)}
                    </motion.span>
                  </>
                )}
              </div>
            </FadeUp>

            {/* Quantity */}
            <FadeUp delay={0.4}>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("product.quantity")}</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-border rounded-lg">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={quantity}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.15 }}
                        className="w-12 text-center font-medium"
                      >
                        {quantity}
                      </motion.span>
                    </AnimatePresence>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </FadeUp>

            {/* Actions */}
            <FadeUp delay={0.5}>
              <div className="flex gap-4">
                <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="gold"
                    size="xl"
                    className="w-full"
                    onClick={handleAddToCart}
                    disabled={isAddingToCart}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    {isAddingToCart ? t("product.adding") : t("product.addToCart")}
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    variant="outline"
                    size="xl"
                    onClick={() => product && toggleWishlist(product.id)}
                  >
                    <Heart
                      className={`h-5 w-5 transition-colors ${
                        product && isInWishlist(product.id)
                          ? "fill-red-500 text-red-500"
                          : ""
                      }`}
                    />
                  </Button>
                </motion.div>
              </div>
            </FadeUp>

            {/* Description */}
            {product.description && (
              <FadeUp delay={0.6}>
                <div className="pt-6 border-t border-border">
                  <h3 className="font-semibold mb-3">{t("product.description")}</h3>
                  <div className="prose prose-sm text-muted-foreground">
                    {product.description}
                  </div>
                </div>
              </FadeUp>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <FadeUp delay={0.4}>
            <div className="mt-16 pt-12 border-t border-border">
              <h2 className="font-display text-2xl font-bold mb-6">{t("product.relatedProducts")}</h2>
              <div className="px-12">
                <Carousel opts={{ align: "start", loop: true }}>
                  <CarouselContent>
                    {relatedProducts.map((p) => (
                      <CarouselItem key={p.id} className="basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                        <ProductCard product={p as Parameters<typeof ProductCard>[0]["product"]} />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </div>
            </div>
          </FadeUp>
        )}
      </div>
    </MainLayout>
  );
}
