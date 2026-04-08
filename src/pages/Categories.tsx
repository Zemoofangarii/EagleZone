import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Helmet } from "react-helmet-async";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  product_count: number;
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      // Fetch categories with product count
      const { data: categoriesData, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching categories:", error);
        setLoading(false);
        return;
      }

      // Get product counts for each category
      const categoriesWithCounts = await Promise.all(
        (categoriesData || []).map(async (cat) => {
          const { count } = await supabase
            .from("product_categories")
            .select("*", { count: "exact", head: true })
            .eq("category_id", cat.id);

          return {
            ...cat,
            product_count: count || 0,
          };
        })
      );

      setCategories(categoriesWithCounts);
      setLoading(false);
    }

    fetchCategories();
  }, []);

  return (
    <MainLayout>
      <Helmet>
        <title>Categories - Eagle Zone</title>
        <meta name="description" content="Browse our product categories and find what you're looking for." />
      </Helmet>

      <div className="container py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Shop by <span className="gradient-text">Category</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explore our curated collections and find the perfect products for your needs.
          </p>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] rounded-xl" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-16 bg-card/50 rounded-lg border border-border">
            <p className="text-muted-foreground mb-4">No categories found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/categories/${category.slug}`}
                className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover-lift"
              >
                {/* Background Image */}
                {category.image_url ? (
                  <img
                    src={category.image_url}
                    alt={category.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-card to-muted" />
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />

                {/* Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <h3 className="font-display text-2xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
                      {category.description}
                    </p>
                  )}
                  <span className="text-sm text-primary font-medium">
                    {category.product_count} {category.product_count === 1 ? "Product" : "Products"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
