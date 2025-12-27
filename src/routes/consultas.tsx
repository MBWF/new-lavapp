import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
	Droplets,
	Phone,
	Loader2,
	Search,
	Package,
	Calendar,
	Truck,
	Clock,
	CheckCircle2,
	XCircle,
	Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";
import { ordersQueries, type Order } from "@/supabase/queries/orders";
import {
	orderStatusLabels,
	orderStatusColors,
	deliveryTypeLabels,
} from "@/types/order";

export const Route = createFileRoute("/consultas")({
	component: ConsultasPage,
});

const statusIcons: Record<string, React.ReactNode> = {
	RECEIVED: <Package className="h-4 w-4" />,
	WASHING: <Sparkles className="h-4 w-4" />,
	READY: <CheckCircle2 className="h-4 w-4" />,
	DELIVERED: <Truck className="h-4 w-4" />,
	CANCELLED: <XCircle className="h-4 w-4" />,
};

function ConsultasPage() {
	const [phone, setPhone] = useState("");
	const [orders, setOrders] = useState<Order[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [hasSearched, setHasSearched] = useState(false);
	const [error, setError] = useState("");

	const formatPhone = (value: string) => {
		const digits = value.replace(/\D/g, "");
		if (digits.length <= 2) return digits;
		if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
		if (digits.length <= 11)
			return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
		return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
	};

	const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const formatted = formatPhone(e.target.value);
		setPhone(formatted);
	};

	const handleSearch = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!phone.trim()) return;

		setIsLoading(true);
		setError("");
		setHasSearched(true);

		try {
			const result = await ordersQueries.getByCustomerPhone(phone);
			setOrders(result);
		} catch {
			setError("Erro ao buscar pedidos. Tente novamente.");
			setOrders([]);
		} finally {
			setIsLoading(false);
		}
	};

	const formatDate = (date: Date): string => {
		return new Intl.DateTimeFormat("pt-BR", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		}).format(date);
	};

	return (
		<div className="relative flex min-h-screen flex-col items-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 py-12">
			<div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

			<div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-purple-500/30 blur-3xl" />
			<div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-blue-500/30 blur-3xl" />

			<div className="relative z-10 w-full max-w-2xl">
				{/* Header */}
				<div className="mb-8 text-center">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-2xl shadow-primary/25">
						<Droplets className="h-8 w-8 text-primary-foreground" />
					</div>
					<h1 className="text-3xl font-bold text-white">LavApp</h1>
					<p className="mt-1 text-white/60">Consulte seus pedidos</p>
				</div>

				{/* Search Card */}
				<Card className="border-white/10 bg-white/10 shadow-2xl backdrop-blur-xl">
					<CardHeader className="pb-4 pt-6 text-center">
						<h2 className="text-xl font-semibold text-white">
							Acompanhe seus pedidos
						</h2>
						<p className="text-sm text-white/60">
							Digite seu número de celular para ver o status
						</p>
					</CardHeader>
					<CardContent className="pb-6">
						<form onSubmit={handleSearch} className="space-y-4">
							{error && (
								<div className="rounded-lg bg-destructive/20 p-3 text-center text-sm text-red-300">
									{error}
								</div>
							)}

							<div className="space-y-2">
								<div className="relative">
									<Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
									<Input
										type="tel"
										placeholder="(00) 00000-0000"
										value={phone}
										onChange={handlePhoneChange}
										maxLength={15}
										className="border-white/20 bg-white/10 pl-10 text-white placeholder:text-white/40 focus-visible:border-primary focus-visible:ring-primary/30"
									/>
								</div>
							</div>

							<Button
								type="submit"
								disabled={isLoading || !phone.trim()}
								className="w-full bg-gradient-to-r from-primary to-purple-600 font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
							>
								{isLoading ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Buscando...
									</>
								) : (
									<>
										<Search className="mr-2 h-4 w-4" />
										Buscar Pedidos
									</>
								)}
							</Button>
						</form>
					</CardContent>
				</Card>

				{/* Results */}
				{hasSearched && !isLoading && (
					<div className="mt-6 space-y-4">
						{orders.length > 0 ? (
							<>
								<p className="text-center text-sm text-white/60">
									{orders.length} pedido{orders.length !== 1 ? "s" : ""}{" "}
									encontrado{orders.length !== 1 ? "s" : ""}
								</p>
								{orders.map((order, index) => (
									<Card
										key={order.id}
										className={cn(
											"border-white/10 bg-white/10 shadow-xl backdrop-blur-xl opacity-0 animate-fade-in",
											`stagger-${Math.min(index + 1, 5)}`,
										)}
										style={{ animationFillMode: "forwards" }}
									>
										<CardContent className="p-4">
											<div className="flex items-start justify-between gap-4">
												<div className="flex-1 space-y-3">
													{/* Code & Status */}
													<div className="flex flex-wrap items-center gap-2">
														<span className="rounded-md bg-white/10 px-2 py-1 font-mono text-sm font-medium text-white">
															{order.code}
														</span>
														<span
															className={cn(
																"inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
																orderStatusColors[order.status],
															)}
														>
															{statusIcons[order.status]}
															{orderStatusLabels[order.status]}
														</span>
													</div>

													{/* Details */}
													<div className="grid gap-2 text-sm">
														<div className="flex items-center gap-2 text-white/70">
															<Calendar className="h-4 w-4 text-white/50" />
															<span>
																Criado em {formatDate(order.createdAt)}
															</span>
														</div>
														<div className="flex items-center gap-2 text-white/70">
															<Clock className="h-4 w-4 text-white/50" />
															<span>
																Entrega: {formatDate(order.deliveryDate)} às{" "}
																{order.deliveryTime}
															</span>
														</div>
														<div className="flex items-center gap-2 text-white/70">
															<Truck className="h-4 w-4 text-white/50" />
															<span>
																{deliveryTypeLabels[order.deliveryType]}
															</span>
														</div>
													</div>

													{/* Items Info */}
													<div className="flex items-center gap-4 border-t border-white/10 pt-3">
														<div className="flex items-center gap-1 text-white/70">
															<Package className="h-4 w-4 text-white/50" />
															<span className="text-sm">
																{order.items.length} item
																{order.items.length !== 1 ? "s" : ""}
															</span>
														</div>
														<div className="ml-auto">
															<span className="text-lg font-bold text-emerald-400">
																{formatCurrency(order.total)}
															</span>
														</div>
													</div>
												</div>
											</div>
										</CardContent>
									</Card>
								))}
							</>
						) : (
							<Card className="border-white/10 bg-white/10 shadow-xl backdrop-blur-xl">
								<CardContent className="py-12 text-center">
									<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
										<Package className="h-6 w-6 text-white/50" />
									</div>
									<h3 className="text-lg font-semibold text-white">
										Nenhum pedido encontrado
									</h3>
									<p className="mt-1 text-sm text-white/60">
										Verifique se o número está correto
									</p>
								</CardContent>
							</Card>
						)}
					</div>
				)}

				{/* Footer */}
				<p className="mt-8 text-center text-sm text-white/40">
					© 2024 LavApp. Todos os direitos reservados.
				</p>
			</div>
		</div>
	);
}
