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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { Helmet } from "react-helmet-async";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  image_url: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export default function CategoryForm() {
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
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
  });

  const name = watch("name");

  useEffect(() => {
    if (id) {
      fetchCategory();
    }
  }, [id]);

  // Auto-generate slug from name
  useEffect(() => {
    if (!isEditing && name) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setValue("slug", slug);
    }
  }, [name, isEditing, setValue]);

  async function fetchCategory() {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      toast({
        title: "Error",
        description: "Category not found.",
        variant: "destructive",
      });
      navigate("/admin/categories");
      return;
    }

    setValue("name", data.name);
    setValue("slug", data.slug);
    setValue("description", data.description || "");
    setValue("image_url", data.image_url || "");
    setFetching(false);
  }

  async function onSubmit(data: CategoryFormData) {
    setLoading(true);

    let error;

    if (isEditing) {
      const result = await supabase
        .from("categories")
        .update({
          name: data.name,
          slug: data.slug,
          description: data.description || null,
          image_url: data.image_url || null,
        })
        .eq("id", id);
      error = result.error;
    } else {
      const result = await supabase
        .from("categories")
        .insert([{
          name: data.name,
          slug: data.slug,
          description: data.description || null,
          image_url: data.image_url || null,
        }]);
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
      title: isEditing ? "Category updated" : "Category created",
      description: `"${data.name}" has been ${isEditing ? "updated" : "created"}.`,
    });
    navigate("/admin/categories");
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
        <title>{isEditing ? "Edit Category" : "Add Category"} - Eagle Zone Admin</title>
      </Helmet>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/categories")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-display text-2xl font-bold">
              {isEditing ? "Edit Category" : "Add New Category"}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? "Update category details" : "Create a new product category"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Category Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="Category name"
                  {...register("name")}
                  className="bg-secondary"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  placeholder="category-slug"
                  {...register("slug")}
                  className="bg-secondary"
                />
                {errors.slug && (
                  <p className="text-sm text-destructive">{errors.slug.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Category description"
                  rows={3}
                  {...register("description")}
                  className="bg-secondary"
                />
              </div>

              <ImageUpload
                value={watch("image_url") || ""}
                onChange={(url) => setValue("image_url", url)}
                folder="categories"
                label="Category Image"
              />
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
            {isEditing ? "Update Category" : "Create Category"}
          </Button>
        </form>
      </div>
    </AdminLayout>
  );
}
