import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProductGrid } from "@/components/products/ProductGrid";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";
import type { Product } from "@/types/database";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
}

export default function CategoryDetail() {
  const { slug } = useParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchCategoryAndProducts() {
      if (!slug) return;

      // Fetch category
      const { data: categoryData, error: categoryError } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (categoryError || !categoryData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setCategory(categoryData);

      // Fetch products in this category
      const { data: productCategoryData } = await supabase
        .from("product_categories")
        .select("product_id")
        .eq("category_id", categoryData.id);

      if (productCategoryData && productCategoryData.length > 0) {
        const productIds = productCategoryData.map((pc) => pc.product_id);

        const { data: productsData } = await supabase
          .from("products")
          .select(`*, product_images(*)`)
          .in("id", productIds)
          .eq("published", true)
          .order("created_at", { ascending: false });

        setProducts((productsData as unknown as Product[]) || []);
      }

      setLoading(false);
    }

    fetchCategoryAndProducts();
  }, [slug]);

  if (notFound) {
    return (
      <MainLayout>
        <div className="container py-16 text-center">
          <h1 className="font-display text-3xl font-bold mb-4">Category Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The category you're looking for doesn't exist.
          </p>
          <Link to="/categories">
            <Button variant="gold">Browse Categories</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Helmet>
        <title>{category?.name || "Category"} - High Mirror</title>
        <meta
          name="description"
          content={category?.description || `Browse ${category?.name} products at High Mirror.`}
        />
      </Helmet>

      <div className="container py-12">
        {/* Back Button */}
        <Link to="/categories" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Categories
        </Link>

        {/* Category Header */}
        {category && (
          <div className="relative rounded-xl overflow-hidden mb-12">
            {category.image_url ? (
              <img
                src={category.image_url}
                alt={category.name}
                className="w-full h-64 object-cover"
              />
            ) : (
              <div className="w-full h-64 bg-gradient-to-br from-card to-muted" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-8">
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-2">
                {category.name}
              </h1>
              {category.description && (
                <p className="text-muted-foreground text-lg max-w-2xl">
                  {category.description}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Products */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold">
              Products ({products.length})
            </h2>
          </div>

          <ProductGrid products={products} loading={loading} />

          {!loading && products.length === 0 && (
            <div className="text-center py-16 bg-card/50 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                No products in this category yet.
              </p>
              <Link to="/products">
                <Button variant="gold">Browse All Products</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
