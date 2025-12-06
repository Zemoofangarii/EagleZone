import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Truck, Shield, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProductGrid } from "@/components/products/ProductGrid";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/types/database";
import { Helmet } from "react-helmet-async";

const features = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "On orders over $100",
  },
  {
    icon: Shield,
    title: "Secure Payment",
    description: "100% protected transactions",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    description: "30-day return policy",
  },
];

export default function Index() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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
  }, []);

  return (
    <MainLayout>
      <Helmet>
        <title>LUXE - Premium E-Commerce Store</title>
        <meta
          name="description"
          content="Discover premium products curated for the discerning customer. Free shipping on orders over $100."
        />
        <meta property="og:title" content="LUXE - Premium E-Commerce Store" />
        <meta
          property="og:description"
          content="Discover premium products curated for the discerning customer."
        />
      </Helmet>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
        
        <div className="container relative py-24 md:py-32 lg:py-40">
          <div className="max-w-3xl mx-auto text-center space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">New Collection Available</span>
            </div>
            
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Elevate Your{" "}
              <span className="gradient-text">Style</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
              Discover premium products curated for the discerning customer. 
              Quality meets elegance in every piece.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products">
                <Button variant="hero" size="xl">
                  Shop Now
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/categories">
                <Button variant="outline" size="xl">
                  Explore Categories
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-border bg-card/30">
        <div className="container py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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

      {/* Featured Products */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold">Featured Products</h2>
              <p className="text-muted-foreground mt-2">Hand-picked selections for you</p>
            </div>
            <Link to="/products?featured=true">
              <Button variant="ghost">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          
          <ProductGrid products={featuredProducts} loading={loading} />
          
          {!loading && featuredProducts.length === 0 && (
            <div className="text-center py-16 bg-card/50 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">No featured products yet.</p>
              <Link to="/admin/products">
                <Button variant="gold">Add Products</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-card via-card to-primary/5">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              Join Our Newsletter
            </h2>
            <p className="text-muted-foreground">
              Subscribe to get special offers, free giveaways, and exclusive deals.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button variant="gold" type="submit">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
