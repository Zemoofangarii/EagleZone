import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, Save, Loader2 } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

export default function Account() {
  const { user, profile, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?redirect=/account");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
      });
    }
  }, [profile]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: t("account.profileUpdated"),
        description: t("account.profileUpdatedDesc"),
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: t("common.error"),
        description: t("account.updateFailed"),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (authLoading) {
    return (
      <MainLayout>
        <div className="container py-16 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!user) return null;

  return (
    <MainLayout>
      <Helmet>
        <title>My Account - Eagle Zone</title>
        <meta name="description" content="Manage your account settings and profile" />
      </Helmet>

      <div className="container py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-8">{t("account.title")}</h1>

          {/* Profile Section */}
          <div className="bg-card rounded-lg border border-border p-6 mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">{profile?.full_name || "User"}</h2>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("account.email")}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={user.email || ""}
                    disabled
                    className="pl-10 bg-muted"
                  />
                </div>
                <p className="text-xs text-muted-foreground">{t("account.emailNote")}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_name">{t("account.fullName")}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder={t("account.fullNamePlaceholder")}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t("account.phone")}</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder={t("account.phonePlaceholder")}
                    className="pl-10"
                  />
                </div>
              </div>

              <Button type="submit" variant="gold" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t("common.saving")}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {t("common.save")}
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Quick Links */}
          <div className="grid sm:grid-cols-2 gap-4">
            <button
              onClick={() => navigate("/orders")}
              className="bg-card rounded-lg border border-border p-6 text-left hover:border-primary/50 transition-colors"
            >
              <h3 className="font-semibold mb-1">{t("account.orderHistory")}</h3>
              <p className="text-sm text-muted-foreground">{t("account.orderHistoryDesc")}</p>
            </button>
            <button
              onClick={() => navigate("/addresses")}
              className="bg-card rounded-lg border border-border p-6 text-left hover:border-primary/50 transition-colors"
            >
              <h3 className="font-semibold mb-1">{t("account.addresses")}</h3>
              <p className="text-sm text-muted-foreground">{t("account.addressesDesc")}</p>
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
