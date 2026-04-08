import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Truck, Shield, RotateCcw, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProductGrid } from "@/components/products/ProductGrid";
import { ProductCard } from "@/components/products/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/types/database";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { FadeUp, FadeInView, staggerContainer, staggerItem } from "@/components/animations/MotionWrappers";
import { useParallax, useScrollReveal } from "@/hooks/useScrollAnimation";
import { useTranslation } from "react-i18next";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

interface CategoryWithCount {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  product_count: number;
}

export default function Index() {
  const { t } = useTranslation();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const parallaxRef = useParallax(0.3);
  const featuresRef = useScrollReveal({ y: 40, stagger: 0.12 });
  const ctaRef = useScrollReveal({ y: 50, duration: 0.8 });

  const features = [
    { icon: Truck, title: t("home.freeShipping"), description: t("home.freeShippingDesc") },
    { icon: Shield, title: t("home.securePayment"), description: t("home.securePaymentDesc") },
    { icon: RotateCcw, title: t("home.easyReturns"), description: t("home.easyReturnsDesc") },
  ];

  useEffect(() => {
    async function fetchFeaturedProducts() {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          product_images (*)
        `)
        .eq("published", true)
        .eq("featured", true)
        .limit(4);

      if (!error && data) {
        setFeaturedProducts(data as unknown as Product[]);
      }
      setLoading(false);
    }

    fetchFeaturedProducts();

    async function fetchAllProducts() {
      const { data, error } = await supabase
        .from("products")
        .select(`*, product_images (*)`)
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(12);

      if (!error && data) {
        setAllProducts(data as unknown as Product[]);
      }
    }

    async function fetchCategories() {
      const { data: categoriesData, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) {
        setCategoriesLoading(false);
        return;
      }

      const categoriesWithCounts = await Promise.all(
        (categoriesData || []).map(async (cat) => {
          const { count } = await supabase
            .from("product_categories")
            .select("*", { count: "exact", head: true })
            .eq("category_id", cat.id);
          return { ...cat, product_count: count || 0 };
        })
      );

      setCategories(categoriesWithCounts);
      setCategoriesLoading(false);
    }

    fetchAllProducts();
    fetchCategories();
  }, []);

  return (
    <MainLayout>
      <Helmet>
        <title>{t("home.metaTitle")}</title>
        <meta
          name="description"
          content={t("home.heroSubtitle")}
        />
        <meta property="og:title" content={t("home.metaTitle")} />
        <meta
          property="og:description"
          content={t("home.heroSubtitle")}
        />
      </Helmet>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        <div
          ref={parallaxRef}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl"
        />

        <div className="container relative py-24 md:py-32 lg:py-40">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <FadeUp delay={0.1}>
              <div className="inline-flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2">
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Sparkles className="h-4 w-4 text-primary" />
                </motion.div>
                <span className="text-sm text-muted-foreground">{t("home.badge")}</span>
              </div>
            </FadeUp>

            <FadeUp delay={0.25} y={40}>
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                {t("home.heroTitle")}
              </h1>
            </FadeUp>

            <FadeUp delay={0.4}>
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
                {t("home.heroSubtitle")}
              </p>
            </FadeUp>

            <FadeUp delay={0.55}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/products">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                    <Button variant="hero" size="xl">
                      {t("common.shopNow")}
                      <motion.span
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight className="h-5 w-5" />
                      </motion.span>
                    </Button>
                  </motion.div>
                </Link>
                <Link to="/categories">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                    <Button variant="outline" size="xl">
                      {t("home.exploreCategories")}
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* Features — GSAP stagger reveal on scroll */}
      <section className="border-y border-border bg-card/30">
        <div className="container py-8">
          <div ref={featuresRef} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-center gap-4 justify-center">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products — Framer Motion viewport stagger */}
      <section className="py-16 md:py-24">
        <div className="container">
          <FadeInView direction="up">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-display text-3xl md:text-4xl font-bold">{t("home.featuredProducts")}</h2>
                <p className="text-muted-foreground mt-2">{t("home.featuredSubtitle")}</p>
              </div>
              <Link to="/products?featured=true">
                <Button variant="ghost">
                  {t("common.viewAll")}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </FadeInView>

          <ProductGrid products={featuredProducts} loading={loading} />

          {!loading && featuredProducts.length === 0 && (
            <FadeInView>
              <div className="text-center py-16 bg-card/50 rounded-lg border border-border">
                <p className="text-muted-foreground mb-4">{t("home.noFeatured")}</p>
                <Link to="/admin/products">
                  <Button variant="gold">{t("home.addProducts")}</Button>
                </Link>
              </div>
            </FadeInView>
          )}
        </div>
      </section>

      {/* Products Carousel */}
      <section className="py-16 md:py-24 bg-card/30">
        <div className="container">
          <FadeInView direction="up">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-display text-3xl md:text-4xl font-bold">{t("home.latestProducts")}</h2>
                <p className="text-muted-foreground mt-2">{t("home.latestProductsSubtitle")}</p>
              </div>
              <Link to="/products">
                <Button variant="ghost">
                  {t("common.viewAll")}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </FadeInView>

          {allProducts.length > 0 ? (
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              plugins={[
                Autoplay({ delay: 3000, stopOnInteraction: false }),
              ]}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {allProducts.map((product) => (
                  <CarouselItem key={product.id} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                    <ProductCard product={product} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex -left-4 lg:-left-5" />
              <CarouselNext className="hidden md:flex -right-4 lg:-right-5" />
            </Carousel>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-card rounded-lg overflow-hidden border border-border animate-pulse">
                  <div className="aspect-square bg-muted" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-full" />
                    <div className="h-6 bg-muted rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <FadeInView direction="up">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-display text-3xl md:text-4xl font-bold">{t("home.shopByCategory")}</h2>
                <p className="text-muted-foreground mt-2">{t("home.shopByCategorySubtitle")}</p>
              </div>
              <Link to="/categories">
                <Button variant="ghost">
                  {t("common.viewAll")}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </FadeInView>

          {categoriesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-card rounded-lg overflow-hidden border border-border animate-pulse">
                  <div className="aspect-[4/3] bg-muted" />
                  <div className="p-4 space-y-2">
                    <div className="h-5 bg-muted rounded w-1/2" />
                    <div className="h-4 bg-muted rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : categories.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
            >
              {categories.map((category) => (
                <motion.div key={category.id} variants={staggerItem}>
                  <Link
                    to={`/categories/${category.slug}`}
                    className="group block bg-card rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-muted relative">
                      {category.image_url ? (
                        <img
                          src={category.image_url}
                          alt={category.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="font-display text-lg font-bold text-white">{category.name}</h3>
                        <p className="text-sm text-white/80">
                          {t("home.productsCount", { count: category.product_count })}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-16 bg-card/50 rounded-lg border border-border">
              <p className="text-muted-foreground">{t("home.noFeatured")}</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section — GSAP scroll reveal */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-card via-card to-primary/5">
        <div className="container">
          <div ref={ctaRef} className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              {t("home.newsletter")}
            </h2>
            <p className="text-muted-foreground">
              {t("home.newsletterDesc")}
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder={t("home.emailPlaceholder")}
                className="flex-1 px-4 py-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-shadow duration-300"
              />
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Button variant="gold" type="submit">
                  {t("common.subscribe")}
                </Button>
              </motion.div>
            </form>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
