import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { pieceSchema, type PieceFormData } from "@/schemas/piece-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Piece } from "@/types/piece";

interface PieceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: PieceFormData) => void;
  isLoading?: boolean;
  piece?: Piece | null;
}

export function PieceForm({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
  piece,
}: PieceFormProps) {
  const isEditing = !!piece;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PieceFormData>({
    resolver: zodResolver(pieceSchema),
    defaultValues: {
      name: "",
      price: 0,
      unitType: "UNIDADE",
    },
  });

  useEffect(() => {
    if (piece) {
      reset({
        name: piece.name,
        price: piece.price,
        unitType: piece.unitType,
      });
    } else {
      reset({
        name: "",
        price: 0,
        unitType: "UNIDADE",
      });
    }
  }, [piece, reset]);

  const handleFormSubmit = (data: PieceFormData) => {
    onSubmit(data);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset({
        name: "",
        price: 0,
        unitType: "UNIDADE",
      });
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEditing ? "Editar Peça" : "Nova Peça"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações da peça abaixo."
              : "Preencha as informações da nova peça."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              placeholder="Nome da peça"
              {...register("name")}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Preço (R$) *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0,00"
              {...register("price", { valueAsNumber: true })}
              aria-invalid={!!errors.price}
            />
            {errors.price && (
              <p className="text-sm text-destructive">{errors.price.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="unitType">Tipo de Unidade *</Label>
            <Select
              id="unitType"
              {...register("unitType")}
              error={!!errors.unitType}
            >
              <option value="UNIDADE">Unidade</option>
              <option value="PAR">Par</option>
            </Select>
            {errors.unitType && (
              <p className="text-sm text-destructive">
                {errors.unitType.message}
              </p>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Salvar alterações" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

