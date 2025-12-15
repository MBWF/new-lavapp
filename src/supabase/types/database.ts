export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '13.0.5';
  };
  public: {
    Tables: {
      customers: {
        Row: {
          address: string | null;
          code: string;
          created_at: string;
          email: string | null;
          id: string;
          name: string;
          phone: string;
          updated_at: string;
        };
        Insert: {
          address?: string | null;
          code: string;
          created_at?: string;
          email?: string | null;
          id?: string;
          name: string;
          phone: string;
          updated_at?: string;
        };
        Update: {
          address?: string | null;
          code?: string;
          created_at?: string;
          email?: string | null;
          id?: string;
          name?: string;
          phone?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      order_history: {
        Row: {
          action: string;
          created_at: string;
          description: string;
          id: string;
          order_id: string;
        };
        Insert: {
          action: string;
          created_at?: string;
          description: string;
          id?: string;
          order_id: string;
        };
        Update: {
          action?: string;
          created_at?: string;
          description?: string;
          id?: string;
          order_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'order_history_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: false;
            referencedRelation: 'orders';
            referencedColumns: ['id'];
          },
        ];
      };
      order_items: {
        Row: {
          created_at: string;
          id: string;
          order_id: string;
          piece_id: string;
          quantity: number;
          subtotal: number;
          unit_price: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          order_id: string;
          piece_id: string;
          quantity: number;
          subtotal: number;
          unit_price: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          order_id?: string;
          piece_id?: string;
          quantity?: number;
          subtotal?: number;
          unit_price?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'order_items_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: false;
            referencedRelation: 'orders';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'order_items_piece_id_fkey';
            columns: ['piece_id'];
            isOneToOne: false;
            referencedRelation: 'pieces';
            referencedColumns: ['id'];
          },
        ];
      };
      orders: {
        Row: {
          code: string;
          created_at: string;
          customer_id: string | null;
          delivery_address: string | null;
          delivery_date: string;
          delivery_time: string;
          delivery_type: string;
          id: string;
          is_anonymous: boolean;
          notes: string | null;
          pickup_date: string;
          pickup_time: string;
          special_instructions: string | null;
          status: string;
          total: number;
          updated_at: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          customer_id?: string | null;
          delivery_address?: string | null;
          delivery_date: string;
          delivery_time: string;
          delivery_type: string;
          id?: string;
          is_anonymous?: boolean;
          notes?: string | null;
          pickup_date: string;
          pickup_time: string;
          special_instructions?: string | null;
          status?: string;
          total?: number;
          updated_at?: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          customer_id?: string | null;
          delivery_address?: string | null;
          delivery_date?: string;
          delivery_time?: string;
          delivery_type?: string;
          id?: string;
          is_anonymous?: boolean;
          notes?: string | null;
          pickup_date?: string;
          pickup_time?: string;
          special_instructions?: string | null;
          status?: string;
          total?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'orders_customer_id_fkey';
            columns: ['customer_id'];
            isOneToOne: false;
            referencedRelation: 'customers';
            referencedColumns: ['id'];
          },
        ];
      };
      pieces: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          price: number;
          unit_type: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          price: number;
          unit_type: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          price?: number;
          unit_type?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      users: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          is_active: boolean;
          name: string;
          password_hash: string;
          role: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          is_active?: boolean;
          name: string;
          password_hash: string;
          role?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          password_hash?: string;
          role?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      generate_customer_code: {
        Args: { customer_name: string };
        Returns: string;
      };
      generate_order_code: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type CustomerRow = Tables<'customers'>;
export type CustomerInsert = TablesInsert<'customers'>;
export type CustomerUpdate = TablesUpdate<'customers'>;

export type PieceRow = Tables<'pieces'>;
export type PieceInsert = TablesInsert<'pieces'>;
export type PieceUpdate = TablesUpdate<'pieces'>;

export type OrderRow = Tables<'orders'>;
export type OrderInsert = TablesInsert<'orders'>;
export type OrderUpdate = TablesUpdate<'orders'>;

export type OrderItemRow = Tables<'order_items'>;
export type OrderItemInsert = TablesInsert<'order_items'>;
export type OrderItemUpdate = TablesUpdate<'order_items'>;

export type OrderHistoryRow = Tables<'order_history'>;
export type OrderHistoryInsert = TablesInsert<'order_history'>;
export type OrderHistoryUpdate = TablesUpdate<'order_history'>;

export type UserRow = Tables<'users'>;
export type UserInsert = TablesInsert<'users'>;
export type UserUpdate = TablesUpdate<'users'>;
