import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { MainLayout } from "@/components/layout/MainLayout";
import { FadeUp, FadeInView, staggerContainer, staggerItem } from "@/components/animations/MotionWrappers";
import { Award, Gem, Heart, ShieldCheck, Truck, Users } from "lucide-react";

const stats = [
  { value: "10K+", label: "Happy Customers" },
  { value: "500+", label: "Premium Products" },
  { value: "50+", label: "Global Brands" },
  { value: "24/7", label: "Customer Support" },
];

const values = [
  {
    icon: Gem,
    title: "Premium Quality",
    description:
      "Every product is handpicked and rigorously tested to meet our exceptional standards of quality and craftsmanship.",
  },
  {
    icon: ShieldCheck,
    title: "Authenticity Guaranteed",
    description:
      "We work directly with brands and authorized distributors to ensure every item is 100% authentic.",
  },
  {
    icon: Heart,
    title: "Customer First",
    description:
      "Your satisfaction is our priority. We go above and beyond to deliver an experience you'll love.",
  },
  {
    icon: Truck,
    title: "Fast & Free Shipping",
    description:
      "Enjoy complimentary shipping on all orders, with express delivery options available worldwide.",
  },
  {
    icon: Award,
    title: "Curated Selection",
    description:
      "Our team of experts curates each collection to bring you the finest and most trending products.",
  },
  {
    icon: Users,
    title: "Community Driven",
    description:
      "Join a growing community of discerning shoppers who value quality, style, and authenticity.",
  },
];

const timeline = [
  { year: "2023", title: "The Beginning", description: "High Mirror was born from a passion for premium products and exceptional customer experiences." },
  { year: "2023", title: "First 1,000 Customers", description: "Reached our first milestone, proving that quality and trust resonate with shoppers everywhere." },
  { year: "2024", title: "Global Expansion", description: "Expanded our reach to serve customers across 30+ countries with localized shipping." },
  { year: "2025", title: "10K+ Community", description: "Grew our community to over 10,000 loyal customers and 500+ premium products." },
];

export default function About() {
  return (
    <MainLayout>
      <Helmet>
        <title>About Us - High Mirror</title>
        <meta
          name="description"
          content="Discover the story behind High Mirror - your destination for premium, curated products. Quality meets elegance."
        />
      </Helmet>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <FadeUp>
              <span className="inline-block px-4 py-1.5 mb-6 text-xs font-semibold uppercase tracking-widest text-primary border border-primary/30 rounded-full">
                Our Story
              </span>
            </FadeUp>
            <FadeUp delay={0.15}>
              <h1 className="font-display text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Redefining{" "}
                <span className="gradient-text">Premium Shopping</span>
              </h1>
            </FadeUp>
            <FadeUp delay={0.3}>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                At High Mirror, we believe everyone deserves access to
                exceptional products. We curate the finest selection of premium
                goods, bringing quality and elegance to your doorstep.
              </p>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border">
        <div className="container mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={staggerItem}
                className="text-center"
              >
                <p className="font-display text-3xl md:text-4xl font-bold gradient-text mb-2">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <FadeInView direction="left">
              <div className="space-y-6">
                <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                  Our Mission
                </span>
                <h2 className="font-display text-3xl md:text-4xl font-bold">
                  Elevating Everyday Essentials
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  We started High Mirror with a simple belief: premium products
                  shouldn't come with premium hassles. Our mission is to make
                  luxury accessible, authentic, and effortless.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Every product in our collection goes through a meticulous
                  selection process. We partner with trusted brands and artisans
                  worldwide to bring you items that combine exceptional quality
                  with timeless design.
                </p>
              </div>
            </FadeInView>

            <FadeInView direction="right">
              <div className="relative">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border border-border overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-4 p-8">
                      <Gem className="h-16 w-16 text-primary mx-auto" />
                      <p className="font-display text-2xl font-bold">
                        Quality Over Quantity
                      </p>
                      <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                        We'd rather offer 500 exceptional products than 50,000
                        mediocre ones.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
                <div className="absolute -top-4 -left-4 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
              </div>
            </FadeInView>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-4">
          <FadeInView className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              What We Stand For
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-4">
              Our Core Values
            </h2>
            <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
              These principles guide everything we do, from product selection to
              customer service.
            </p>
          </FadeInView>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {values.map((value) => (
              <motion.div
                key={value.title}
                variants={staggerItem}
                className="group relative p-8 rounded-2xl border border-border bg-card hover:border-primary/40 transition-colors duration-300"
              >
                <div className="mb-5 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                  <value.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-3">
                  {value.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <FadeInView className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              Our Journey
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-4">
              The High Mirror Story
            </h2>
          </FadeInView>

          <div className="max-w-2xl mx-auto">
            {timeline.map((item, index) => (
              <FadeInView key={index} delay={index * 0.1}>
                <div className="relative pl-10 pb-12 last:pb-0">
                  {/* Timeline line */}
                  {index < timeline.length - 1 && (
                    <div className="absolute left-[15px] top-10 bottom-0 w-px bg-border" />
                  )}
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-1 w-8 h-8 rounded-full border-2 border-primary bg-background flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  </div>
                  {/* Content */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                      {item.year}
                    </span>
                    <h3 className="font-display text-lg font-semibold">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </FadeInView>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 border-t border-border">
        <div className="container mx-auto px-4">
          <FadeInView>
            <div className="relative max-w-3xl mx-auto text-center rounded-3xl border border-border bg-card p-12 md:p-16 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
              <div className="relative z-10 space-y-6">
                <h2 className="font-display text-3xl md:text-4xl font-bold">
                  Ready to Experience{" "}
                  <span className="gradient-text">Premium?</span>
                </h2>
                <p className="text-muted-foreground max-w-lg mx-auto">
                  Join thousands of satisfied customers who trust High Mirror
                  for their premium product needs.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                  <a
                    href="/products"
                    className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                  >
                    Shop Now
                  </a>
                  <a
                    href="/categories"
                    className="inline-flex items-center justify-center px-8 py-3 rounded-full border border-border font-medium hover:bg-muted transition-colors"
                  >
                    Browse Categories
                  </a>
                </div>
              </div>
            </div>
          </FadeInView>
        </div>
      </section>
    </MainLayout>
  );
}
