import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { Helmet } from "react-helmet-async";

const productSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  short_description: z.string().optional(),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be positive"),
  compare_at_price: z.coerce.number().optional(),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);
  const isEditing = !!id;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      published: false,
      featured: false,
      price: 0,
    },
  });

  const title = watch("title");

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!isEditing && title) {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setValue("slug", slug);
    }
  }, [title, isEditing, setValue]);

  async function fetchProduct() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      toast({
        title: "Error",
        description: "Product not found.",
        variant: "destructive",
      });
      navigate("/admin/products");
      return;
    }

    setValue("title", data.title);
    setValue("slug", data.slug);
    setValue("short_description", data.short_description || "");
    setValue("description", data.description || "");
    setValue("price", data.price);
    setValue("compare_at_price", data.compare_at_price || undefined);
    setValue("seo_title", data.seo_title || "");
    setValue("seo_description", data.seo_description || "");
    setValue("published", data.published);
    setValue("featured", data.featured);
    setFetching(false);
  }

  async function onSubmit(data: ProductFormData) {
    setLoading(true);

    const productPayload = {
      title: data.title,
      slug: data.slug,
      short_description: data.short_description || null,
      description: data.description || null,
      price: data.price,
      compare_at_price: data.compare_at_price || null,
      seo_title: data.seo_title || null,
      seo_description: data.seo_description || null,
      published: data.published,
      featured: data.featured,
    };

    let error;

    if (isEditing) {
      const result = await supabase
        .from("products")
        .update(productPayload)
        .eq("id", id);
      error = result.error;
    } else {
      const result = await supabase
        .from("products")
        .insert([productPayload]);
      error = result.error;
    }

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: isEditing ? "Product updated" : "Product created",
      description: `"${data.title}" has been ${isEditing ? "updated" : "created"}.`,
    });
    navigate("/admin/products");
  }

  if (fetching) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Helmet>
        <title>{isEditing ? "Edit Product" : "Add Product"} - LUXE Admin</title>
      </Helmet>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/products")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-display text-2xl font-bold">
              {isEditing ? "Edit Product" : "Add New Product"}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? "Update product details" : "Add a new product to your catalog"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder="Product title"
                      {...register("title")}
                      className="bg-secondary"
                    />
                    {errors.title && (
                      <p className="text-sm text-destructive">{errors.title.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                      id="slug"
                      placeholder="product-slug"
                      {...register("slug")}
                      className="bg-secondary"
                    />
                    {errors.slug && (
                      <p className="text-sm text-destructive">{errors.slug.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="short_description">Short Description</Label>
                    <Textarea
                      id="short_description"
                      placeholder="Brief product summary"
                      rows={2}
                      {...register("short_description")}
                      className="bg-secondary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Full Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Detailed product description"
                      rows={5}
                      {...register("description")}
                      className="bg-secondary"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pricing</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...register("price")}
                      className="bg-secondary"
                    />
                    {errors.price && (
                      <p className="text-sm text-destructive">{errors.price.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="compare_at_price">Compare at Price</Label>
                    <Input
                      id="compare_at_price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...register("compare_at_price")}
                      className="bg-secondary"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>SEO</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="seo_title">SEO Title</Label>
                    <Input
                      id="seo_title"
                      placeholder="SEO optimized title"
                      {...register("seo_title")}
                      className="bg-secondary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="seo_description">SEO Description</Label>
                    <Textarea
                      id="seo_description"
                      placeholder="Meta description for search engines"
                      rows={2}
                      {...register("seo_description")}
                      className="bg-secondary"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="published">Published</Label>
                    <Switch
                      id="published"
                      checked={watch("published")}
                      onCheckedChange={(checked) => setValue("published", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="featured">Featured</Label>
                    <Switch
                      id="featured"
                      checked={watch("featured")}
                      onCheckedChange={(checked) => setValue("featured", checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Button
                type="submit"
                variant="gold"
                className="w-full"
                disabled={loading}
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? "Update Product" : "Create Product"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
