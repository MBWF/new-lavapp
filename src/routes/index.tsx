import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  DollarSign,
  Loader2,
  ShoppingBag,
  Users,
  TrendingUp,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
  LineChart,
  Legend,
} from "recharts";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCustomers } from "@/hooks/use-customers";
import { useOrders } from "@/hooks/use-orders";
import { useFinancialSummary, useRevenueByPeriod, type PeriodType } from "@/hooks/use-financial-reports";
import { cn, formatCurrency, formatPhone } from "@/lib/utils";
import { paymentMethodLabels } from "@/types/order";

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
  
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('day');
  const [financialPeriod, setFinancialPeriod] = useState<'today' | 'week' | 'month' | 'year'>('month');
  
  const getFinancialDateRange = () => {
    const now = new Date();
    const start = new Date();
    
    switch (financialPeriod) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        break;
      case 'week':
        start.setDate(now.getDate() - 7);
        break;
      case 'month':
        start.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        start.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    return { start, end: now };
  };
  
  const { start: financialStart, end: financialEnd } = getFinancialDateRange();
  const { data: financialSummary, isLoading: isLoadingFinancial } = useFinancialSummary(financialStart, financialEnd);
  const { data: revenueData } = useRevenueByPeriod(selectedPeriod);

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

  const financialPeriodLabels = {
    today: 'Hoje',
    week: 'Últimos 7 dias',
    month: 'Último mês',
    year: 'Último ano',
  };

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

        <Card className="stagger-5 animate-fade-in opacity-0" style={{ animationFillMode: "forwards" }}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-semibold text-base">Relatório Financeiro</CardTitle>
              <p className="text-muted-foreground text-sm">{financialPeriodLabels[financialPeriod]}</p>
            </div>
            <Select value={financialPeriod} onValueChange={(value) => setFinancialPeriod(value as any)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="week">Últimos 7 dias</SelectItem>
                <SelectItem value="month">Último mês</SelectItem>
                <SelectItem value="year">Último ano</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            {isLoadingFinancial ? (
              <div className="flex h-[200px] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Receita Total</p>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="mt-2 font-bold text-2xl">{formatCurrency(financialSummary.totalRevenue)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{financialSummary.totalOrders} pedidos</p>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Receita Recebida</p>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="mt-2 font-bold text-2xl text-green-600">{formatCurrency(financialSummary.paidRevenue)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{Math.round(financialSummary.paymentRate)}% pago</p>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">A Receber</p>
                    <XCircle className="h-4 w-4 text-yellow-500" />
                  </div>
                  <p className="mt-2 font-bold text-2xl text-yellow-600">{formatCurrency(financialSummary.unpaidRevenue)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Pendente</p>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Taxa de Pagamento</p>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="mt-2 font-bold text-2xl">{Math.round(financialSummary.paymentRate)}%</p>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div 
                      className="h-full bg-primary transition-all" 
                      style={{ width: `${financialSummary.paymentRate}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 space-y-3">
              <p className="font-medium text-sm">Por forma de pagamento</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {Object.entries(financialSummary.byPaymentMethod).map(([method, data]) => (
                  <div key={method} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                    <div>
                      <p className="text-sm font-medium">{paymentMethodLabels[method as keyof typeof paymentMethodLabels]}</p>
                      <p className="text-xs text-muted-foreground">{data.count} pedidos</p>
                    </div>
                    <p className="font-semibold text-sm">{formatCurrency(data.total)}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-7">
          <Card
            className="stagger-6 animate-fade-in opacity-0 lg:col-span-4"
            style={{ animationFillMode: "forwards" }}
          >
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-semibold text-base">
                  Receita por Período
                </CardTitle>
                <p className="text-muted-foreground text-sm">Total vs Recebida</p>
              </div>
              <Select value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as PeriodType)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Por dia</SelectItem>
                  <SelectItem value="week">Por semana</SelectItem>
                  <SelectItem value="month">Por mês</SelectItem>
                  <SelectItem value="year">Por ano</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      className="fill-muted-foreground text-xs"
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      className="fill-muted-foreground text-xs"
                      tickFormatter={(value) => `R$ ${value}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="totalRevenue"
                      name="Receita Total"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="paidRevenue"
                      name="Receita Recebida"
                      stroke="hsl(142.1 76.2% 36.3%)"
                      strokeWidth={2}
                      dot={{ fill: "hsl(142.1 76.2% 36.3%)" }}
                    />
                  </LineChart>
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
