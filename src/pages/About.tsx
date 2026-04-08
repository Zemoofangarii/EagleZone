import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { MainLayout } from "@/components/layout/MainLayout";
import { FadeUp, FadeInView, staggerContainer, staggerItem } from "@/components/animations/MotionWrappers";
import { Award, Gem, Heart, ShieldCheck, Truck, Users } from "lucide-react";

const timeline = [
  { year: "2023", title: "The Beginning", description: "Eagle Zone was born from a passion for premium products and exceptional customer experiences." },
  { year: "2023", title: "First 1,000 Customers", description: "Reached our first milestone, proving that quality and trust resonate with shoppers everywhere." },
  { year: "2024", title: "Global Expansion", description: "Expanded our reach to serve customers across 30+ countries with localized shipping." },
  { year: "2025", title: "10K+ Community", description: "Grew our community to over 10,000 loyal customers and 500+ premium products." },
];

export default function About() {
  const { t } = useTranslation();

  const stats = [
    { value: "10K+", label: t("about.happyCustomers") },
    { value: "500+", label: t("about.premiumProducts") },
    { value: "50+", label: t("about.globalBrands") },
    { value: "24/7", label: t("about.customerSupport") },
  ];

  const values = [
    {
      icon: Gem,
      title: t("about.premiumQuality"),
      description: t("about.premiumQualityDesc"),
    },
    {
      icon: ShieldCheck,
      title: t("about.authenticity"),
      description: t("about.authenticityDesc"),
    },
    {
      icon: Heart,
      title: t("about.customerFirst"),
      description: t("about.customerFirstDesc"),
    },
    {
      icon: Truck,
      title: t("about.fastShipping"),
      description: t("about.fastShippingDesc"),
    },
    {
      icon: Award,
      title: t("about.curatedSelection"),
      description: t("about.curatedSelectionDesc"),
    },
    {
      icon: Users,
      title: t("about.communityDriven"),
      description: t("about.communityDrivenDesc"),
    },
  ];

  return (
    <MainLayout>
      <Helmet>
        <title>About Us - Eagle Zone</title>
        <meta
          name="description"
          content="Discover the story behind Eagle Zone - your destination for premium, curated products. Quality meets elegance."
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
                {t("about.badge")}
              </span>
            </FadeUp>
            <FadeUp delay={0.15}>
              <h1 className="font-display text-4xl md:text-6xl font-bold mb-6 leading-tight">
                {t("about.title")}
              </h1>
            </FadeUp>
            <FadeUp delay={0.3}>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                {t("about.subtitle")}
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
                  {t("about.missionBadge")}
                </span>
                <h2 className="font-display text-3xl md:text-4xl font-bold">
                  {t("about.missionTitle")}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t("about.missionP1")}
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  {t("about.missionP2")}
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
                        {t("about.missionP3")}
                      </p>
                      <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                        {t("about.missionP3Desc")}
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
              {t("about.valuesBadge")}
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-4">
              {t("about.valuesTitle")}
            </h2>
            <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
              {t("about.valuesSubtitle")}
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
              {t("about.journeyBadge")}
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-4">
              {t("about.journeyTitle")}
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
                  {t("about.ctaTitle")}
                </h2>
                <p className="text-muted-foreground max-w-lg mx-auto">
                  {t("about.ctaSubtitle")}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                  <a
                    href="/products"
                    className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                  >
                    {t("common.shopNow")}
                  </a>
                  <a
                    href="/categories"
                    className="inline-flex items-center justify-center px-8 py-3 rounded-full border border-border font-medium hover:bg-muted transition-colors"
                  >
                    {t("common.browseCategories")}
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
