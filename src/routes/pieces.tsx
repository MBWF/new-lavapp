import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search, Pencil, Trash2, Package, Loader2 } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { PieceForm } from "@/components/pieces/piece-form";
import { DeletePieceDialog } from "@/components/pieces/delete-piece-dialog";
import {
	usePieces,
	useCreatePiece,
	useUpdatePiece,
	useDeletePiece,
} from "@/hooks/use-pieces";
import { toast } from "@/hooks/use-toast";
import { formatCurrency, cn } from "@/lib/utils";
import type { Piece } from "@/types/piece";
import type { PieceFormData } from "@/schemas/piece-schema";

export const Route = createFileRoute("/pieces")({
	component: PiecesPage,
});

const ITEMS_PER_PAGE = 10;

const unitTypeLabels: Record<string, string> = {
	UNIDADE: "Unidade",
	PAR: "Par",
};

function PiecesPage() {
	const [search, setSearch] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);

	const { data: pieces = [], isLoading } = usePieces();
	const createPiece = useCreatePiece();
	const updatePiece = useUpdatePiece();
	const deletePiece = useDeletePiece();

	const filteredPieces = useMemo(() => {
		if (!search) return pieces;
		const lowerSearch = search.toLowerCase();
		return pieces.filter((p) => p.name.toLowerCase().includes(lowerSearch));
	}, [pieces, search]);

	const paginatedPieces = useMemo(() => {
		const start = (currentPage - 1) * ITEMS_PER_PAGE;
		return filteredPieces.slice(start, start + ITEMS_PER_PAGE);
	}, [filteredPieces, currentPage]);

	const totalPages = Math.ceil(filteredPieces.length / ITEMS_PER_PAGE);

	const handleCreatePiece = () => {
		setSelectedPiece(null);
		setIsFormOpen(true);
	};

	const handleEditPiece = (piece: Piece) => {
		setSelectedPiece(piece);
		setIsFormOpen(true);
	};

	const handleDeletePiece = (piece: Piece) => {
		setSelectedPiece(piece);
		setIsDeleteOpen(true);
	};

	const handleFormSubmit = async (data: PieceFormData) => {
		const priceValue =
			typeof data.price === "string" ? parseFloat(data.price) : data.price;

		if (selectedPiece) {
			await updatePiece.mutateAsync(
				{ id: selectedPiece.id, ...data, price: priceValue },
				{
					onSuccess: () => {
						toast({
							title: "Peça atualizada",
							description: "As informações foram salvas com sucesso.",
							variant: "success",
						});
						setIsFormOpen(false);
					},
					onError: () => {
						toast({
							title: "Erro ao atualizar",
							description: "Não foi possível atualizar a peça.",
							variant: "destructive",
						});
					},
				},
			);
		} else {
			await createPiece.mutateAsync(
				{ ...data, price: priceValue },
				{
					onSuccess: () => {
						toast({
							title: "Peça cadastrada",
							description: "A nova peça foi cadastrada com sucesso.",
							variant: "success",
						});
						setIsFormOpen(false);
					},
					onError: () => {
						toast({
							title: "Erro ao cadastrar",
							description: "Não foi possível cadastrar a peça.",
							variant: "destructive",
						});
					},
				},
			);
		}
	};

	const handleConfirmDelete = async () => {
		if (!selectedPiece) return;

		await deletePiece.mutateAsync(selectedPiece.id, {
			onSuccess: () => {
				toast({
					title: "Peça excluída",
					description: "A peça foi removida com sucesso.",
					variant: "success",
				});
				setIsDeleteOpen(false);
				setSelectedPiece(null);
			},
			onError: () => {
				toast({
					title: "Erro ao excluir",
					description: "Não foi possível excluir a peça.",
					variant: "destructive",
				});
			},
		});
	};

	return (
		<div className="flex flex-col">
			<Header title="Peças" description="Gerencie as peças da sua lavanderia" />

			<div className="flex-1 space-y-6 p-6">
				<Card
					className="animate-fade-in"
					style={{ animationFillMode: "forwards" }}
				>
					<CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div className="relative max-w-sm flex-1">
							<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								placeholder="Buscar por nome..."
								value={search}
								onChange={(e) => {
									setSearch(e.target.value);
									setCurrentPage(1);
								}}
								className="pl-9"
							/>
						</div>
						<Button onClick={handleCreatePiece} className="gap-2">
							<Plus className="h-4 w-4" />
							Nova Peça
						</Button>
					</CardHeader>

					<CardContent>
						{isLoading ? (
							<div className="flex items-center justify-center py-12">
								<Loader2 className="h-8 w-8 animate-spin text-primary" />
							</div>
						) : paginatedPieces.length > 0 ? (
							<>
								<div className="rounded-lg border">
									<Table>
										<TableHeader>
											<TableRow className="bg-muted/50">
												<TableHead className="w-[300px]">Nome</TableHead>
												<TableHead className="w-[150px]">Preço</TableHead>
												<TableHead className="w-[150px]">
													Tipo de Unidade
												</TableHead>
												<TableHead className="w-[100px] text-right">
													Ações
												</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{paginatedPieces.map((piece, index) => (
												<TableRow
													key={piece.id}
													className={cn(
														"opacity-0 animate-fade-in",
														`stagger-${Math.min(index + 1, 5)}`,
													)}
													style={{ animationFillMode: "forwards" }}
												>
													<TableCell>
														<div className="flex items-center gap-3">
															<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
																<Package className="h-4 w-4 text-primary" />
															</div>
															<span className="font-medium">{piece.name}</span>
														</div>
													</TableCell>
													<TableCell>
														<span className="font-semibold text-emerald-600 dark:text-emerald-400">
															{formatCurrency(piece.price)}
														</span>
													</TableCell>
													<TableCell>
														<span
															className={cn(
																"inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
																piece.unitType === "PAR"
																	? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
																	: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
															)}
														>
															{unitTypeLabels[piece.unitType]}
														</span>
													</TableCell>
													<TableCell>
														<div className="flex items-center justify-end gap-1">
															<Tooltip>
																<TooltipTrigger asChild>
																	<Button
																		variant="ghost"
																		size="icon"
																		onClick={() => handleEditPiece(piece)}
																		aria-label="Editar peça"
																	>
																		<Pencil className="h-4 w-4" />
																	</Button>
																</TooltipTrigger>
																<TooltipContent>Editar</TooltipContent>
															</Tooltip>
															<Tooltip>
																<TooltipTrigger asChild>
																	<Button
																		variant="ghost"
																		size="icon"
																		onClick={() => handleDeletePiece(piece)}
																		className="text-muted-foreground hover:text-destructive"
																		aria-label="Excluir peça"
																	>
																		<Trash2 className="h-4 w-4" />
																	</Button>
																</TooltipTrigger>
																<TooltipContent>Excluir</TooltipContent>
															</Tooltip>
														</div>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</div>

								{totalPages > 1 && (
									<div className="mt-4 flex items-center justify-between">
										<p className="text-sm text-muted-foreground">
											Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} a{" "}
											{Math.min(
												currentPage * ITEMS_PER_PAGE,
												filteredPieces.length,
											)}{" "}
											de {filteredPieces.length} peças
										</p>
										<div className="flex items-center gap-2">
											<Button
												variant="outline"
												size="sm"
												onClick={() =>
													setCurrentPage((p) => Math.max(1, p - 1))
												}
												disabled={currentPage === 1}
											>
												Anterior
											</Button>
											<div className="flex items-center gap-1">
												{Array.from(
													{ length: totalPages },
													(_, i) => i + 1,
												).map((page) => (
													<Button
														key={page}
														variant={
															currentPage === page ? "default" : "outline"
														}
														size="sm"
														className="w-9"
														onClick={() => setCurrentPage(page)}
													>
														{page}
													</Button>
												))}
											</div>
											<Button
												variant="outline"
												size="sm"
												onClick={() =>
													setCurrentPage((p) => Math.min(totalPages, p + 1))
												}
												disabled={currentPage === totalPages}
											>
												Próxima
											</Button>
										</div>
									</div>
								)}
							</>
						) : (
							<div className="flex flex-col items-center justify-center py-12 text-center">
								<div className="rounded-full bg-muted p-4">
									<Package className="h-8 w-8 text-muted-foreground" />
								</div>
								<h3 className="mt-4 text-lg font-semibold">
									Nenhuma peça encontrada
								</h3>
								<p className="mt-1 text-sm text-muted-foreground">
									{search
										? "Tente buscar com outros termos"
										: "Comece cadastrando sua primeira peça"}
								</p>
								{!search && (
									<Button onClick={handleCreatePiece} className="mt-4 gap-2">
										<Plus className="h-4 w-4" />
										Cadastrar Peça
									</Button>
								)}
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			<PieceForm
				open={isFormOpen}
				onOpenChange={setIsFormOpen}
				onSubmit={handleFormSubmit}
				isLoading={createPiece.isPending || updatePiece.isPending}
				piece={selectedPiece}
			/>

			<DeletePieceDialog
				open={isDeleteOpen}
				onOpenChange={setIsDeleteOpen}
				onConfirm={handleConfirmDelete}
				isLoading={deletePiece.isPending}
				piece={selectedPiece}
			/>
		</div>
	);
}
