import { useState } from 'react';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Package,
  ShoppingCart,
} from 'lucide-react';
import { usePieces } from '@/hooks/use-pieces';
import { useOrderWizard } from '../order-wizard-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatCurrency, cn } from '@/lib/utils';
import type { Piece } from '@/types/piece';

const unitTypeLabels: Record<string, string> = {
  UNIDADE: 'un',
  PAR: 'par',
};

export function StepPieces() {
  const { data, addItem, removeItem, updateItemQuantity, getTotal } =
    useOrderWizard();
  const { data: pieces = [], isLoading } = usePieces();
  const [search, setSearch] = useState('');

  const filteredPieces = pieces.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleAddPiece = (piece: Piece) => {
    addItem(piece);
  };

  const getItemQuantity = (pieceId: string): number => {
    const item = data.items.find((i) => i.piece.id === pieceId);
    return item?.quantity ?? 0;
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Selecione as Peças</h2>
            <p className="text-muted-foreground">
              Adicione as peças do pedido com suas quantidades
            </p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar peça..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filteredPieces.map((piece) => {
              const quantity = getItemQuantity(piece.id);
              const isAdded = quantity > 0;

              return (
                <Card
                  key={piece.id}
                  className={cn(
                    'transition-all',
                    isAdded && 'border-primary/50 bg-primary/5',
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
                          <Package className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{piece.name}</p>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(piece.price)}
                            </span>
                            <span className="text-muted-foreground">
                              / {unitTypeLabels[piece.unitType]}
                            </span>
                          </div>
                        </div>
                      </div>

                      {isAdded ? (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              updateItemQuantity(piece.id, quantity - 1)
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">
                            {quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              updateItemQuantity(piece.id, quantity + 1)
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleAddPiece(piece)}
                          className="gap-1"
                        >
                          <Plus className="h-4 w-4" />
                          Adicionar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <div className="lg:sticky lg:top-6 lg:self-start">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShoppingCart className="h-5 w-5" />
              Resumo do Pedido
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.items.length === 0 ? (
              <div className="py-8 text-center">
                <Package className="mx-auto h-10 w-10 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Nenhuma peça adicionada
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {data.items.map((item) => (
                    <div
                      key={item.piece.id}
                      className="flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {item.piece.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity}x {formatCurrency(item.piece.price)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {formatCurrency(item.subtotal)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => removeItem(item.piece.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-xl font-bold text-primary">
                    {formatCurrency(getTotal())}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
