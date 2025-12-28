import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  DollarSign,
  Loader2,
  ShoppingBag,
  Users,
} from "lucide-react";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCustomers } from "@/hooks/use-customers";
import { useOrders } from "@/hooks/use-orders";
import { cn, formatCurrency, formatPhone } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: DashboardPage,
});

interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  delay: number;
}

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  gradient,
  delay,
}: StatCardProps) {
  const isPositive = change >= 0;

  return (
    <Card
      className={cn(
        "relative animate-fade-in overflow-hidden opacity-0",
        `stagger-${delay}`
      )}
      style={{ animationFillMode: "forwards" }}
    >
      <div className={cn("absolute inset-0 opacity-5", gradient)} />
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="font-medium text-muted-foreground text-sm">
          {title}
        </CardTitle>
        <div className={cn("rounded-lg p-2", gradient)}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="font-bold text-2xl">{value}</div>
        <div className="mt-1 flex items-center gap-1 text-xs">
          {isPositive ? (
            <ArrowUpRight className="h-3 w-3 text-green-500" />
          ) : (
            <ArrowDownRight className="h-3 w-3 text-red-500" />
          )}
          <span className={isPositive ? "text-green-500" : "text-red-500"}>
            {Math.abs(change)}%
          </span>
          <span className="text-muted-foreground">vs. semana passada</span>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardPage() {
  const { data: customers = [] } = useCustomers();
  const { data: orders = [], isLoading: isLoadingOrders } = useOrders();
  const recentCustomers = customers.slice(0, 5);

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastWeekStart = new Date(today);
    lastWeekStart.setDate(today.getDate() - 7);
    const twoWeeksAgoStart = new Date(today);
    twoWeeksAgoStart.setDate(today.getDate() - 14);

    const ordersToday = orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime();
    });

    const ordersThisMonth = orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= firstDayOfMonth;
    });

    const ordersLastWeek = orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= lastWeekStart && orderDate < today;
    });

    const ordersTwoWeeksAgo = orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= twoWeeksAgoStart && orderDate < lastWeekStart;
    });

    const customersLastWeek = customers.filter((customer) => {
      const customerDate = new Date(customer.createdAt);
      return customerDate >= lastWeekStart && customerDate < today;
    });

    const customersTwoWeeksAgo = customers.filter((customer) => {
      const customerDate = new Date(customer.createdAt);
      return customerDate >= twoWeeksAgoStart && customerDate < lastWeekStart;
    });

    const pendingOrders = orders.filter(
      (order) => order.status !== "DELIVERED" && order.status !== "CANCELLED"
    );

    const revenueThisMonth = ordersThisMonth.reduce(
      (sum, order) => sum + order.total,
      0
    );

    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    return {
      totalCustomers: customers.length,
      customersChange: calculateChange(
        customersLastWeek.length,
        customersTwoWeeksAgo.length
      ),
      ordersToday: ordersToday.length,
      ordersTodayChange: calculateChange(
        ordersLastWeek.length,
        ordersTwoWeeksAgo.length
      ),
      revenueThisMonth,
      revenueChange: 0,
      pendingOrders: pendingOrders.length,
      pendingOrdersChange: 0,
    };
  }, [orders, customers]);

  const chartData = useMemo(() => {
    const last7Days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const dayName = date.toLocaleDateString("pt-BR", { weekday: "short" });
      const formattedDayName =
        dayName.charAt(0).toUpperCase() + dayName.slice(1);

      const ordersCount = orders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === date.getTime();
      }).length;

      last7Days.push({
        name: formattedDayName,
        pedidos: ordersCount,
      });
    }

    return last7Days;
  }, [orders]);

  const weekTrend = useMemo(() => {
    const today = new Date();
    const lastWeekStart = new Date(today);
    lastWeekStart.setDate(today.getDate() - 7);
    const previousWeekStart = new Date(today);
    previousWeekStart.setDate(today.getDate() - 14);

    const lastWeekOrders = orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= lastWeekStart && orderDate < today;
    }).length;

    const previousWeekOrders = orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= previousWeekStart && orderDate < lastWeekStart;
    }).length;

    if (previousWeekOrders === 0) {
      return lastWeekOrders > 0 ? 100 : 0;
    }

    return Math.round(
      ((lastWeekOrders - previousWeekOrders) / previousWeekOrders) * 100
    );
  }, [orders]);

  if (isLoadingOrders) {
    return (
      <div className="flex h-full flex-col">
        <Header title="Dashboard" description="Visão geral do seu negócio" />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <Header title="Dashboard" description="Visão geral do seu negócio" />

      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total de Clientes"
            value={stats.totalCustomers}
            change={stats.customersChange}
            icon={Users}
            gradient="bg-gradient-to-br from-violet-500 to-purple-600"
            delay={1}
          />
          <StatCard
            title="Pedidos Hoje"
            value={stats.ordersToday}
            change={stats.ordersTodayChange}
            icon={ShoppingBag}
            gradient="bg-gradient-to-br from-blue-500 to-cyan-600"
            delay={2}
          />
          <StatCard
            title="Receita do Mês"
            value={formatCurrency(stats.revenueThisMonth)}
            change={stats.revenueChange}
            icon={DollarSign}
            gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
            delay={3}
          />
          <StatCard
            title="Pedidos Pendentes"
            value={stats.pendingOrders}
            change={stats.pendingOrdersChange}
            icon={Clock}
            gradient="bg-gradient-to-br from-orange-500 to-amber-600"
            delay={4}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-7">
          <Card
            className="stagger-5 animate-fade-in opacity-0 lg:col-span-4"
            style={{ animationFillMode: "forwards" }}
          >
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-semibold text-base">
                  Pedidos da Semana
                </CardTitle>
                <p className="text-muted-foreground text-sm">Últimos 7 dias</p>
              </div>
              {weekTrend !== 0 && (
                <div
                  className={cn(
                    "flex items-center gap-1 rounded-lg px-2 py-1 font-medium text-xs",
                    weekTrend >= 0
                      ? "bg-green-500/10 text-green-600 dark:text-green-400"
                      : "bg-red-500/10 text-red-600 dark:text-red-400"
                  )}
                >
                  {weekTrend >= 0 ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {weekTrend >= 0 ? "+" : ""}
                  {weekTrend}%
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient
                        id="colorPedidos"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="hsl(var(--primary))"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="hsl(var(--primary))"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      className="fill-muted-foreground text-xs"
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      className="fill-muted-foreground text-xs"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="pedidos"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorPedidos)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card
            className="stagger-5 animate-fade-in opacity-0 lg:col-span-3"
            style={{ animationFillMode: "forwards", animationDelay: "0.3s" }}
          >
            <CardHeader>
              <CardTitle className="font-semibold text-base">
                Clientes Recentes
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                {recentCustomers.length} últimos cadastros
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentCustomers.map((customer, index) => (
                  <div
                    key={customer.id}
                    className={cn(
                      "flex animate-slide-in-left items-center justify-between rounded-lg border p-3 opacity-0 transition-colors hover:bg-muted/50",
                      `stagger-${index + 1}`
                    )}
                    style={{ animationFillMode: "forwards" }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 font-semibold text-primary text-sm">
                        {customer.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{customer.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {formatPhone(customer.phone)}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-md bg-muted px-2 py-1 font-mono text-xs">
                      {customer.code}
                    </span>
                  </div>
                ))}
                {recentCustomers.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Users className="h-10 w-10 text-muted-foreground/50" />
                    <p className="mt-2 text-muted-foreground text-sm">
                      Nenhum cliente cadastrado
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
