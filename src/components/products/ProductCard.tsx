import { Link } from "react-router-dom";
import { ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import type { Product, ProductImage } from "@/types/database";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

interface ProductCardProps {
  product: Product & {
    product_images?: ProductImage[];
    categories?: { id: string; name: string; slug: string }[];
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id, 1);
  }

  function handleToggleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  }
  const primaryImage = product.product_images?.[0]?.url || product.images?.[0]?.url;
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100)
    : 0;

  return (
    <motion.div
      className="group relative bg-card rounded-lg overflow-hidden border border-border hover:border-primary/30 transition-colors duration-300"
      whileHover={{ y: -6, boxShadow: "0 12px 40px hsl(0 0% 0% / 0.3)" }}
      transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
    >
      {/* Image */}
      <Link to={`/products/${product.slug}`} className="block aspect-square overflow-hidden">
        {primaryImage ? (
          <motion.img
            src={primaryImage}
            alt={product.title}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-muted-foreground text-sm">No image</span>
          </div>
        )}

        {/* Discount Badge */}
        {hasDiscount && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.2 }}
            className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded"
          >
            -{discountPercent}%
          </motion.span>
        )}

        {/* Featured Badge */}
        {product.featured && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.3 }}
            className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded"
          >
            Featured
          </motion.span>
        )}

        {/* Wishlist Button */}
        <motion.button
          onClick={handleToggleWishlist}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.2 }}
          className={`absolute ${product.featured ? "top-10" : "top-3"} right-3 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center border border-border hover:border-red-500 transition-colors`}
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              isInWishlist(product.id)
                ? "fill-red-500 text-red-500"
                : "text-muted-foreground"
            }`}
          />
        </motion.button>
      </Link>

      {/* Content */}
      <div className="p-4 space-y-2">
        {/* Category Badge */}
        {product.categories && product.categories.length > 0 && (
          <Link
            to={`/categories/${product.categories[0].slug}`}
            className="text-xs text-primary hover:underline"
          >
            {product.categories[0].name}
          </Link>
        )}

        <Link to={`/products/${product.slug}`}>
          <h3 className="font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {product.title}
          </h3>
        </Link>

        {product.short_description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.short_description}
          </p>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-foreground">
              {t("common.currency")} {product.price.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                {t("common.currency")} {product.compare_at_price!.toFixed(2)}
              </span>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Button
              size="icon"
              variant="gold"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
