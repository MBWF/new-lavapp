import { supabase } from "../client";
import type { PieceRow, PieceInsert, PieceUpdate } from "../types/database";

export type UnitType = "UNIDADE" | "PAR";

export interface Piece {
  id: string;
  name: string;
  price: number;
  unitType: UnitType;
  createdAt: Date;
  updatedAt: Date;
}

const mapPieceRowToPiece = (row: PieceRow): Piece => ({
  id: row.id,
  name: row.name,
  price: row.price,
  unitType: row.unit_type as UnitType,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
});

export interface CreatePieceInput {
  name: string;
  price: number;
  unitType: UnitType;
}

export interface UpdatePieceInput extends Partial<CreatePieceInput> {
  id: string;
}

export const piecesQueries = {
  getAll: async (): Promise<Piece[]> => {
    const { data, error } = await supabase
      .from("pieces")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;
    return data.map(mapPieceRowToPiece);
  },

  getById: async (id: string): Promise<Piece | null> => {
    const { data, error } = await supabase
      .from("pieces")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return mapPieceRowToPiece(data);
  },

  create: async (input: CreatePieceInput): Promise<Piece> => {
    const insertData: PieceInsert = {
      name: input.name,
      price: input.price,
      unit_type: input.unitType,
    };

    const { data, error } = await supabase
      .from("pieces")
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    return mapPieceRowToPiece(data);
  },

  update: async (input: UpdatePieceInput): Promise<Piece> => {
    const updateData: PieceUpdate = {};

    if (input.name !== undefined) updateData.name = input.name;
    if (input.price !== undefined) updateData.price = input.price;
    if (input.unitType !== undefined) updateData.unit_type = input.unitType;

    const { data, error } = await supabase
      .from("pieces")
      .update(updateData)
      .eq("id", input.id)
      .select()
      .single();

    if (error) throw error;
    return mapPieceRowToPiece(data);
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from("pieces").delete().eq("id", id);

    if (error) throw error;
  },

  search: async (query: string): Promise<Piece[]> => {
    const { data, error } = await supabase
      .from("pieces")
      .select("*")
      .ilike("name", `%${query}%`)
      .order("name", { ascending: true });

    if (error) throw error;
    return data.map(mapPieceRowToPiece);
  },
};

