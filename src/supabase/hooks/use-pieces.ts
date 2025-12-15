import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  piecesQueries,
  type Piece,
  type UnitType,
  type CreatePieceInput,
  type UpdatePieceInput,
} from '../queries';

const PIECES_KEY = 'pieces';

export const usePieces = () => {
  return useQuery({
    queryKey: [PIECES_KEY],
    queryFn: piecesQueries.getAll,
  });
};

export const usePiece = (id: string) => {
  return useQuery({
    queryKey: [PIECES_KEY, id],
    queryFn: () => piecesQueries.getById(id),
    enabled: !!id,
  });
};

export const useSearchPieces = (query: string) => {
  return useQuery({
    queryKey: [PIECES_KEY, 'search', query],
    queryFn: () => piecesQueries.search(query),
    enabled: query.length > 0,
  });
};

export const useCreatePiece = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePieceInput) => piecesQueries.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PIECES_KEY] });
    },
  });
};

export const useUpdatePiece = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdatePieceInput) => piecesQueries.update(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [PIECES_KEY] });
      queryClient.setQueryData([PIECES_KEY, data.id], data);
    },
  });
};

export const useDeletePiece = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => piecesQueries.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PIECES_KEY] });
    },
  });
};

export type { Piece, UnitType, CreatePieceInput, UpdatePieceInput };
