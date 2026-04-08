import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <span className="font-display text-2xl font-bold gradient-text">{t("common.brandName")}</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              {t("footer.tagline")}
            </p>
          </div>

          {/* Shop */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm uppercase tracking-wider">{t("footer.shop")}</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/products" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("footer.allProducts")}
              </Link>
              <Link to="/categories" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("footer.categories")}
              </Link>
              <Link to="/products?featured=true" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("footer.featured")}
              </Link>
            </nav>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm uppercase tracking-wider">{t("footer.support")}</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("footer.contactUs")}
              </Link>
              <Link to="/shipping" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("footer.shipping")}
              </Link>
              <Link to="/returns" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("footer.returns")}
              </Link>
              <Link to="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("footer.faq")}
              </Link>
            </nav>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm uppercase tracking-wider">{t("footer.legal")}</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("footer.privacyPolicy")}
              </Link>
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("footer.termsOfService")}
              </Link>
            </nav>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            {t("footer.copyright", { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  );
}
