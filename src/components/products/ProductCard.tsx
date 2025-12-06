import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product, ProductImage } from "@/types/database";

interface ProductCardProps {
  product: Product & { product_images?: ProductImage[] };
}

export function ProductCard({ product }: ProductCardProps) {
  const primaryImage = product.product_images?.[0]?.url || product.images?.[0]?.url;
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100)
    : 0;

  return (
    <div className="group relative bg-card rounded-lg overflow-hidden border border-border hover:border-primary/30 transition-all duration-300 hover-lift">
      {/* Image */}
      <Link to={`/products/${product.slug}`} className="block aspect-square overflow-hidden">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-muted-foreground text-sm">No image</span>
          </div>
        )}
        
        {/* Discount Badge */}
        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded">
            -{discountPercent}%
          </span>
        )}

        {/* Featured Badge */}
        {product.featured && (
          <span className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">
            Featured
          </span>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 space-y-2">
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
              ${product.price.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                ${product.compare_at_price!.toFixed(2)}
              </span>
            )}
          </div>
          
          <Button size="icon" variant="gold" className="opacity-0 group-hover:opacity-100 transition-opacity">
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
