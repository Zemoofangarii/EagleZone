import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Package, FolderTree, ShoppingCart, Users, TrendingUp, Plus } from "lucide-react";
import { Helmet } from "react-helmet-async";

interface Stats {
  products: number;
  categories: number;
  orders: number;
  users: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    products: 0,
    categories: 0,
    orders: 0,
    users: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const [productsRes, categoriesRes, ordersRes, usersRes] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("categories").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }),
        supabase.from("user_profiles").select("id", { count: "exact", head: true }),
      ]);

      setStats({
        products: productsRes.count || 0,
        categories: categoriesRes.count || 0,
        orders: ordersRes.count || 0,
        users: usersRes.count || 0,
      });
      setLoading(false);
    }

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Products",
      value: stats.products,
      icon: Package,
      href: "/admin/products",
      color: "text-blue-500",
    },
    {
      title: "Categories",
      value: stats.categories,
      icon: FolderTree,
      href: "/admin/categories",
      color: "text-green-500",
    },
    {
      title: "Orders",
      value: stats.orders,
      icon: ShoppingCart,
      href: "/admin/orders",
      color: "text-amber-500",
    },
    {
      title: "Customers",
      value: stats.users,
      icon: Users,
      href: "/admin/users",
      color: "text-purple-500",
    },
  ];

  return (
    <AdminLayout>
      <Helmet>
        <title>Dashboard - LUXE Admin</title>
      </Helmet>

      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back! Here's what's happening with your store.
            </p>
          </div>
          <Link to="/admin/products/new">
            <Button variant="gold">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => (
            <Link key={stat.title} to={stat.href}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {loading ? (
                      <span className="animate-pulse bg-muted rounded h-8 w-16 block" />
                    ) : (
                      stat.value
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/admin/products/new" className="block">
                <Button variant="admin" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Product
                </Button>
              </Link>
              <Link to="/admin/categories/new" className="block">
                <Button variant="admin" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Category
                </Button>
              </Link>
              <Link to="/admin/orders" className="block">
                <Button variant="admin" className="w-full justify-start">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  View Recent Orders
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                Welcome to your LUXE admin panel! Here you can manage your products,
                categories, orders, and more.
              </p>
              <ul className="space-y-2">
                <li>• <strong>Products:</strong> Add and manage your product catalog</li>
                <li>• <strong>Categories:</strong> Organize products into collections</li>
                <li>• <strong>Orders:</strong> Track and fulfill customer orders</li>
                <li>• <strong>Users:</strong> Manage customer accounts and roles</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
