"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { getUsersCount, getUsersOverTime } from "@/lib/services/userService";
import { getProductsCount, getProductCategories } from "@/lib/services/productService";
import { getReclamationsCount, getReclamationsOverTime } from "@/lib/services/reclamationService";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";

import { getStores } from "@/lib/services/storeService";
import { groupDataByMonth } from "@/lib/utils/date";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, DollarSign, Users, Store, Package, ShoppingCart, TrendingUp, CreditCard, BarChart, PieChart as PieChartIcon, LineChart as LineChartIcon, MapPin } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Area,
  AreaChart,
  ComposedChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap,
  ScatterChart
} from "recharts";

// Dynamically import AdminLayout with no SSR
const AdminLayout = dynamic(() => import('@/components/layout/AdminLayout'), { ssr: false });

// Dynamically import MapComponent with no SSR
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => <Skeleton className="h-[400px] w-full" />
});

// Custom content for treemap
const CustomizedContent = ({ root, depth, x, y, width, height, index, name, value }) => {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: `hsl(var(--chart-${(index % 5) + 1}))`,
          stroke: '#fff',
          strokeWidth: 2 / (depth + 1e-10),
          strokeOpacity: 1 / (depth + 1e-10),
        }}
      />
      {width > 50 && height > 30 && (
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          fill="#fff"
          fontSize={14}
        >
          {name}
        </text>
      )}
    </g>
  );
};

// Product Visualization Component
const ProductVisualization = ({ products }) => {
  const [viewType, setViewType] = useState("treemap");
  
  // Process data for treemap
  const treemapData = products.map(product => ({
    name: product.nom,
    size: product.prix,
    category: product.categorie
  }));

  // Process data for bubble chart
  const bubbleData = products.reduce((acc, product) => {
    const category = product.categorie || "Uncategorized";
    if (!acc[category]) {
      acc[category] = {
        name: category,
        value: 0,
        products: []
      };
    }
    acc[category].value += product.prix;
    acc[category].products.push(product);
    return acc;
  }, {});

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Product Analysis</CardTitle>
          <div className="space-x-2">
            <Button
              variant={viewType === "treemap" ? "default" : "outline"}
              onClick={() => setViewType("treemap")}
              size="sm"
            >
              Treemap
            </Button>
            <Button
              variant={viewType === "bubble" ? "default" : "outline"}
              onClick={() => setViewType("bubble")}
              size="sm"
            >
              Bubble
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          {viewType === "treemap" ? (
            <Treemap
              data={treemapData}
              dataKey="size"
              nameKey="name"
              fill="hsl(var(--chart-1))"
              content={<CustomizedContent />}
            />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <XAxis type="number" dataKey="x" name="price" />
                <YAxis type="number" dataKey="y" name="quantity" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter
                  data={Object.values(bubbleData).map((category, index) => ({
                    x: category.value,
                    y: category.products.length,
                    z: category.value / category.products.length,
                    name: category.name
                  }))}
                  fill="hsl(var(--chart-1))"
                >
                  {Object.values(bubbleData).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${(index % 5) + 1}))`} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalReclamations: 0,
  });
  const [usersOverTime, setUsersOverTime] = useState<{ date: string; value: number }[]>([]);
  const [reclamationsOverTime, setReclamationsOverTime] = useState<{ date: string; value: number }[]>([]);
  const [productCategories, setProductCategories] = useState<{ name: string; value: number }[]>([]);
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  
  // Chart colors
  const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];
  
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setDataLoading(true);
        
        // Fetch all data in parallel
        const [users, products, reclamations, userTimeData, reclamationTimeData, categoryData, storesData] = await Promise.all([
          getUsersCount(),
          getProductsCount(),
          getReclamationsCount(),
          getUsersOverTime(),
          getReclamationsOverTime(),
          getProductCategories(),
          getStores()
        ]);
        
        setStats({
          totalUsers: users,
          totalProducts: products,
          totalReclamations: reclamations
        });
        
        // Process time series data
        setUsersOverTime(groupDataByMonth(userTimeData));
        setReclamationsOverTime(groupDataByMonth(reclamationTimeData));
        setProductCategories(categoryData);
        setStores(storesData);
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setDataLoading(false);
      }
    };
    
    if (user) {
      fetchDashboardData();
    }
  }, [user]);
  
  // Combined data for the overview chart
  const combinedData = usersOverTime.map((item, index) => ({
    date: item.date,
    users: item.value,
    reclamations: reclamationsOverTime[index]?.value || 0
  }));

  // Radar chart data
  const radarData = [
    { subject: 'Users', A: stats.totalUsers, fullMark: stats.totalUsers * 1.2 },
    { subject: 'Products', A: stats.totalProducts, fullMark: stats.totalProducts * 1.2 },
    { subject: 'Reclamations', A: stats.totalReclamations, fullMark: stats.totalReclamations * 1.2 },
    { subject: 'Stores', A: stores.length, fullMark: stores.length * 1.2 },
  ];
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">Loading...</div>
      </div>
    );
  }
  
  if (!user) {
    return null;
  }
  
  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold">Dashboard Overview</h1>
          <div className="flex items-center gap-2">
            <BarChart className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Real-time Analytics</span>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {dataLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {dataLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats.totalProducts.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+15% from last month</p>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Reclamations</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {dataLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats.totalReclamations.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">-5% from last month</p>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Stores</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {dataLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stores.length}</div>
                  <p className="text-xs text-muted-foreground">+2 new this month</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Store Locations Map */}
        <Card>
          <CardHeader>
            <CardTitle>Store Locations</CardTitle>
            <CardDescription>Geographic distribution of stores</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <MapComponent
              stores={stores}
              selectedMarker={selectedStore}
              onMarkerClick={setSelectedStore}
              onClosePopup={() => setSelectedStore(null)}
            />
          </CardContent>
        </Card>
        
        {/* Overview Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Overview</CardTitle>
            <CardDescription>
              Combined view of users and reclamations over time
            </CardDescription>
          </CardHeader>
          <CardContent className="h-96">
            {dataLoading ? (
              <div className="flex items-center justify-center h-full">
                <Skeleton className="w-full h-full" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={combinedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                    labelStyle={{ color: 'hsl(var(--card-foreground))' }}
                  />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="users"
                    name="Users"
                    fill="hsl(var(--chart-1))"
                    stroke="hsl(var(--chart-1))"
                    fillOpacity={0.3}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="reclamations"
                    name="Reclamations"
                    fill="hsl(var(--chart-2))"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        
        {/* Detailed Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Product Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Product Categories</CardTitle>
              <CardDescription>
                Distribution of products by category
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {dataLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Skeleton className="w-full h-full" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={productCategories}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {productCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip
                      formatter={(value, name) => [`${value} products`, name]}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                      labelStyle={{ color: 'hsl(var(--card-foreground))' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
          
          {/* User Growth Trend */}
          <Card>
            <CardHeader>
              <CardTitle>User Growth Trend</CardTitle>
              <CardDescription>
                Monthly user registration trend
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {dataLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Skeleton className="w-full h-full" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={usersOverTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                      labelStyle={{ color: 'hsl(var(--card-foreground))' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      name="Users"
                      stroke="hsl(var(--chart-3))"
                      fill="hsl(var(--chart-3))"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Additional Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Radar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Metrics</CardTitle>
              <CardDescription>
                Comparative view of key metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {dataLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Skeleton className="w-full h-full" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis />
                    <Radar
                      name="Metrics"
                      dataKey="A"
                      stroke="hsl(var(--chart-1))"
                      fill="hsl(var(--chart-1))"
                      fillOpacity={0.6}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                      labelStyle={{ color: 'hsl(var(--card-foreground))' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Scatter Plot */}
          <Card>
            <CardHeader>
              <CardTitle>Users vs Reclamations</CardTitle>
              <CardDescription>
                Correlation between users and reclamations
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {dataLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Skeleton className="w-full h-full" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={combinedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="users" name="Users" />
                    <YAxis dataKey="reclamations" name="Reclamations" />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                      labelStyle={{ color: 'hsl(var(--card-foreground))' }}
                    />
                    <Legend />
                    <Scatter
                      name="Users vs Reclamations"
                      data={combinedData}
                      fill="hsl(var(--chart-4))"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}