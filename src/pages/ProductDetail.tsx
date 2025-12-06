import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Minus, Plus, ShoppingCart, Heart, ArrowLeft } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Product, ProductImage } from "@/types/database";
import { Helmet } from "react-helmet-async";
import { useToast } from "@/hooks/use-toast";

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

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

      setProduct(data as unknown as Product);
      setLoading(false);
    }

    fetchProduct();
  }, [slug, navigate]);

  function handleAddToCart() {
    toast({
      title: "Added to cart",
      description: `${quantity}x ${product?.title} added to your cart.`,
    });
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

  const images = product.images || (product as any).product_images || [];
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;

  return (
    <MainLayout>
      <Helmet>
        <title>{product.seo_title || product.title} - LUXE</title>
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
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate("/products")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-card border border-border">
              {images.length > 0 ? (
                <img
                  src={images[selectedImage]?.url}
                  alt={images[selectedImage]?.alt_text || product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <span className="text-muted-foreground">No image</span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img: ProductImage, idx: number) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(idx)}
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
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
                {product.title}
              </h1>
              {product.short_description && (
                <p className="text-muted-foreground">{product.short_description}</p>
              )}
            </div>

            {/* Price */}
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold">${product.price.toFixed(2)}</span>
              {hasDiscount && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    ${product.compare_at_price!.toFixed(2)}
                  </span>
                  <span className="bg-destructive text-destructive-foreground text-sm font-bold px-2 py-1 rounded">
                    Save ${(product.compare_at_price! - product.price).toFixed(2)}
                  </span>
                </>
              )}
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Quantity</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
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

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                variant="gold"
                size="xl"
                className="flex-1"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
              <Button variant="outline" size="xl">
                <Heart className="h-5 w-5" />
              </Button>
            </div>

            {/* Description */}
            {product.description && (
              <div className="pt-6 border-t border-border">
                <h3 className="font-semibold mb-3">Description</h3>
                <div className="prose prose-sm text-muted-foreground">
                  {product.description}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
