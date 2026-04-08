import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProductGrid } from "@/components/products/ProductGrid";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Product, Category } from "@/types/database";
import { Helmet } from "react-helmet-async";
import { SlidersHorizontal } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Products() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");

  const featuredOnly = searchParams.get("featured") === "true";
  const categoryId = searchParams.get("category");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      // Fetch categories
      const { data: categoriesData } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (categoriesData) {
        setCategories(categoriesData as Category[]);
      }

      // If filtering by category, get product IDs first
      let productIds: string[] | null = null;
      if (categoryId) {
        const { data: productCategoryData } = await supabase
          .from("product_categories")
          .select("product_id")
          .eq("category_id", categoryId);

        productIds = productCategoryData?.map((pc) => pc.product_id) || [];
      }

      // Build products query
      let query = supabase
        .from("products")
        .select(`
          *,
          product_images (*)
        `)
        .eq("published", true);

      if (featuredOnly) {
        query = query.eq("featured", true);
      }

      if (productIds !== null) {
        if (productIds.length === 0) {
          setProducts([]);
          setLoading(false);
          return;
        }
        query = query.in("id", productIds);
      }

      // Apply sorting
      switch (sortBy) {
        case "price-asc":
          query = query.order("price", { ascending: true });
          break;
        case "price-desc":
          query = query.order("price", { ascending: false });
          break;
        case "name":
          query = query.order("title", { ascending: true });
          break;
        default:
          query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;

      if (!error && data) {
        setProducts(data as unknown as Product[]);
      }

      setLoading(false);
    }

    fetchData();
  }, [featuredOnly, categoryId, sortBy]);

  const selectedCategory = categories.find((c) => c.id === categoryId);

  function handleCategoryChange(value: string) {
    const newParams = new URLSearchParams(searchParams);
    if (value === "all") {
      newParams.delete("category");
    } else {
      newParams.set("category", value);
    }
    setSearchParams(newParams);
  }

  function handleClearFilters() {
    setSearchParams({});
  }

  return (
    <MainLayout>
      <Helmet>
        <title>
          {selectedCategory ? `${selectedCategory.name} - ` : ""}
          {featuredOnly ? t("products.featured") : t("products.shopAll")} - Eagle Zone
        </title>
        <meta
          name="description"
          content="Browse our curated collection of premium products. Find quality items with free shipping on orders over $100."
        />
      </Helmet>

      <div className="container py-8 md:py-12">
        {/* Header */}
        <div className="space-y-4 mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold">
            {selectedCategory
              ? selectedCategory.name
              : featuredOnly
              ? t("products.featured")
              : t("products.shopAll")}
          </h1>
          <p className="text-muted-foreground">
            {selectedCategory
              ? t("products.browseIn", { category: selectedCategory.name })
              : featuredOnly
              ? t("products.featuredSubtitle")
              : t("products.discoverAll")}
          </p>
        </div>

        {/* Filters & Sort */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8 pb-6 border-b border-border">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={!featuredOnly && !categoryId ? "default" : "outline"}
              size="sm"
              onClick={handleClearFilters}
            >
              {t("products.all")}
            </Button>
            <Button
              variant={featuredOnly ? "default" : "outline"}
              size="sm"
              onClick={() => {
                const newParams = new URLSearchParams(searchParams);
                if (featuredOnly) {
                  newParams.delete("featured");
                } else {
                  newParams.set("featured", "true");
                }
                setSearchParams(newParams);
              }}
            >
              {t("products.featured")}
            </Button>

            {/* Category Filter */}
            <Select value={categoryId || "all"} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-[160px] bg-secondary">
                <SelectValue placeholder={t("products.category")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("products.allCategories")}</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] bg-secondary">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">{t("products.newest")}</SelectItem>
                  <SelectItem value="price-asc">{t("products.priceLowHigh")}</SelectItem>
                  <SelectItem value="price-desc">{t("products.priceHighLow")}</SelectItem>
                  <SelectItem value="name">{t("products.nameAZ")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <ProductGrid products={products} loading={loading} />

        {/* Empty State */}
        {!loading && products.length === 0 && (
          <div className="text-center py-16 bg-card/50 rounded-lg border border-border">
            <p className="text-muted-foreground mb-4">{t("products.noProducts")}</p>
            <Button variant="outline" onClick={handleClearFilters}>
              {t("common.clearFilters")}
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
