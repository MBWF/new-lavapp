import { supabase } from '../client';
import type {
  OrderRow,
  OrderInsert,
  OrderUpdate,
  OrderItemRow,
  OrderItemInsert,
  OrderHistoryRow,
  OrderHistoryInsert,
  CustomerRow,
  PieceRow,
} from '../types/database';

export type OrderStatus =
  | 'RECEIVED'
  | 'WASHING'
  | 'READY'
  | 'DELIVERED'
  | 'CANCELLED';
export type DeliveryType = 'PICKUP' | 'DELIVERY';

export interface OrderItem {
  id: string;
  piece: PieceRow;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderHistory {
  id: string;
  action: string;
  description: string;
  createdAt: Date;
}

export interface Order {
  id: string;
  code: string;
  customer: CustomerRow | null;
  isAnonymous: boolean;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  deliveryType: DeliveryType;
  pickupDate: Date;
  pickupTime: string;
  deliveryDate: Date;
  deliveryTime: string;
  deliveryAddress?: string;
  notes?: string;
  specialInstructions?: string;
  history: OrderHistory[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderInput {
  customerId?: string;
  isAnonymous: boolean;
  items: Array<{
    pieceId: string;
    quantity: number;
    unitPrice: number;
  }>;
  deliveryType: DeliveryType;
  pickupDate: Date;
  pickupTime: string;
  deliveryDate: Date;
  deliveryTime: string;
  deliveryAddress?: string;
  notes?: string;
  specialInstructions?: string;
}

export interface UpdateOrderInput {
  id: string;
  status?: OrderStatus;
  items?: Array<{
    pieceId: string;
    quantity: number;
    unitPrice: number;
  }>;
  deliveryType?: DeliveryType;
  pickupDate?: Date;
  pickupTime?: string;
  deliveryDate?: Date;
  deliveryTime?: string;
  deliveryAddress?: string;
  notes?: string;
  specialInstructions?: string;
}

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0]!;
};

const parseOrder = async (
  orderRow: OrderRow,
  itemsRows: (OrderItemRow & { pieces: PieceRow })[],
  historyRows: OrderHistoryRow[],
  customer: CustomerRow | null,
): Promise<Order> => {
  return {
    id: orderRow.id,
    code: orderRow.code,
    customer,
    isAnonymous: orderRow.is_anonymous,
    items: itemsRows.map((item) => ({
      id: item.id,
      piece: item.pieces,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      subtotal: item.subtotal,
    })),
    total: orderRow.total,
    status: orderRow.status as OrderStatus,
    deliveryType: orderRow.delivery_type as DeliveryType,
    pickupDate: new Date(orderRow.pickup_date),
    pickupTime: orderRow.pickup_time,
    deliveryDate: new Date(orderRow.delivery_date),
    deliveryTime: orderRow.delivery_time,
    deliveryAddress: orderRow.delivery_address ?? undefined,
    notes: orderRow.notes ?? undefined,
    specialInstructions: orderRow.special_instructions ?? undefined,
    history: historyRows.map((h) => ({
      id: h.id,
      action: h.action,
      description: h.description,
      createdAt: new Date(h.created_at),
    })),
    createdAt: new Date(orderRow.created_at),
    updatedAt: new Date(orderRow.updated_at),
  };
};

export const ordersQueries = {
  getAll: async (): Promise<Order[]> => {
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (ordersError) throw ordersError;

    const orders: Order[] = [];

    for (const orderRow of ordersData) {
      const { data: itemsData } = await supabase
        .from('order_items')
        .select('*, pieces(*)')
        .eq('order_id', orderRow.id);

      const { data: historyData } = await supabase
        .from('order_history')
        .select('*')
        .eq('order_id', orderRow.id)
        .order('created_at', { ascending: true });

      let customer: CustomerRow | null = null;
      if (orderRow.customer_id) {
        const { data: customerData } = await supabase
          .from('customers')
          .select('*')
          .eq('id', orderRow.customer_id)
          .single();
        customer = customerData;
      }

      orders.push(
        await parseOrder(
          orderRow,
          (itemsData as (OrderItemRow & { pieces: PieceRow })[]) ?? [],
          historyData ?? [],
          customer,
        ),
      );
    }

    return orders;
  },

  getById: async (id: string): Promise<Order | null> => {
    const { data: orderRow, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    const { data: itemsData } = await supabase
      .from('order_items')
      .select('*, pieces(*)')
      .eq('order_id', orderRow.id);

    const { data: historyData } = await supabase
      .from('order_history')
      .select('*')
      .eq('order_id', orderRow.id)
      .order('created_at', { ascending: true });

    let customer: CustomerRow | null = null;
    if (orderRow.customer_id) {
      const { data: customerData } = await supabase
        .from('customers')
        .select('*')
        .eq('id', orderRow.customer_id)
        .single();
      customer = customerData;
    }

    return parseOrder(
      orderRow,
      (itemsData as (OrderItemRow & { pieces: PieceRow })[]) ?? [],
      historyData ?? [],
      customer,
    );
  },

  create: async (input: CreateOrderInput): Promise<Order> => {
    const { data: codeData, error: codeError } = await supabase.rpc(
      'generate_order_code',
    );

    if (codeError) throw codeError;

    const total = input.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );

    const orderInsert: OrderInsert = {
      code: codeData,
      customer_id: input.customerId,
      is_anonymous: input.isAnonymous,
      total,
      status: 'RECEIVED',
      delivery_type: input.deliveryType,
      pickup_date: formatDate(input.pickupDate),
      pickup_time: input.pickupTime,
      delivery_date: formatDate(input.deliveryDate),
      delivery_time: input.deliveryTime,
      delivery_address: input.deliveryAddress,
      notes: input.notes,
      special_instructions: input.specialInstructions,
    };

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert(orderInsert)
      .select()
      .single();

    if (orderError) throw orderError;

    const itemsToInsert: OrderItemInsert[] = input.items.map((item) => ({
      order_id: orderData.id,
      piece_id: item.pieceId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      subtotal: item.unitPrice * item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsToInsert);

    if (itemsError) throw itemsError;

    const historyInsert: OrderHistoryInsert = {
      order_id: orderData.id,
      action: 'CREATED',
      description: 'Pedido criado',
    };

    await supabase.from('order_history').insert(historyInsert);

    const createdOrder = await ordersQueries.getById(orderData.id);
    if (!createdOrder) throw new Error('Failed to fetch created order');

    return createdOrder;
  },

  update: async (input: UpdateOrderInput): Promise<Order> => {
    const existingOrder = await ordersQueries.getById(input.id);
    if (!existingOrder) throw new Error('Order not found');

    const historyEntries: OrderHistoryInsert[] = [];

    if (input.status && input.status !== existingOrder.status) {
      historyEntries.push({
        order_id: input.id,
        action: 'STATUS_CHANGED',
        description: `Status alterado para ${input.status}`,
      });
    }

    if (input.items) {
      await supabase.from('order_items').delete().eq('order_id', input.id);

      const itemsToInsert: OrderItemInsert[] = input.items.map((item) => ({
        order_id: input.id,
        piece_id: item.pieceId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        subtotal: item.unitPrice * item.quantity,
      }));

      await supabase.from('order_items').insert(itemsToInsert);

      historyEntries.push({
        order_id: input.id,
        action: 'ITEMS_UPDATED',
        description: 'Itens do pedido atualizados',
      });
    }

    if (input.deliveryType || input.deliveryAddress || input.notes) {
      historyEntries.push({
        order_id: input.id,
        action: 'DELIVERY_UPDATED',
        description: 'Informações de entrega atualizadas',
      });
    }

    const updateData: OrderUpdate = {};
    if (input.status !== undefined) updateData.status = input.status;
    if (input.deliveryType !== undefined)
      updateData.delivery_type = input.deliveryType;
    if (input.pickupDate !== undefined)
      updateData.pickup_date = formatDate(input.pickupDate);
    if (input.pickupTime !== undefined)
      updateData.pickup_time = input.pickupTime;
    if (input.deliveryDate !== undefined)
      updateData.delivery_date = formatDate(input.deliveryDate);
    if (input.deliveryTime !== undefined)
      updateData.delivery_time = input.deliveryTime;
    if (input.deliveryAddress !== undefined)
      updateData.delivery_address = input.deliveryAddress;
    if (input.notes !== undefined) updateData.notes = input.notes;
    if (input.specialInstructions !== undefined)
      updateData.special_instructions = input.specialInstructions;

    if (input.items) {
      updateData.total = input.items.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0,
      );
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', input.id);

    if (updateError) throw updateError;

    if (historyEntries.length > 0) {
      await supabase.from('order_history').insert(historyEntries);
    }

    const updatedOrder = await ordersQueries.getById(input.id);
    if (!updatedOrder) throw new Error('Failed to fetch updated order');

    return updatedOrder;
  },

  updateStatus: async (id: string, status: OrderStatus): Promise<Order> => {
    return ordersQueries.update({ id, status });
  },

  delete: async (id: string): Promise<void> => {
    const order = await ordersQueries.getById(id);

    if (
      order &&
      (order.status === 'DELIVERED' || order.status === 'CANCELLED')
    ) {
      throw new Error('Não é possível excluir pedidos finalizados');
    }

    const { error } = await supabase.from('orders').delete().eq('id', id);

    if (error) throw error;
  },

  search: async (query: string): Promise<Order[]> => {
    const { data: ordersData, error } = await supabase
      .from('orders')
      .select('*')
      .or(`code.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const orders: Order[] = [];

    for (const orderRow of ordersData) {
      const { data: itemsData } = await supabase
        .from('order_items')
        .select('*, pieces(*)')
        .eq('order_id', orderRow.id);

      const { data: historyData } = await supabase
        .from('order_history')
        .select('*')
        .eq('order_id', orderRow.id)
        .order('created_at', { ascending: true });

      let customer: CustomerRow | null = null;
      if (orderRow.customer_id) {
        const { data: customerData } = await supabase
          .from('customers')
          .select('*')
          .eq('id', orderRow.customer_id)
          .single();
        customer = customerData;
      }

      orders.push(
        await parseOrder(
          orderRow,
          (itemsData as (OrderItemRow & { pieces: PieceRow })[]) ?? [],
          historyData ?? [],
          customer,
        ),
      );
    }

    return orders;
  },

  getByStatus: async (status: OrderStatus): Promise<Order[]> => {
    const { data: ordersData, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const orders: Order[] = [];

    for (const orderRow of ordersData) {
      const { data: itemsData } = await supabase
        .from('order_items')
        .select('*, pieces(*)')
        .eq('order_id', orderRow.id);

      const { data: historyData } = await supabase
        .from('order_history')
        .select('*')
        .eq('order_id', orderRow.id)
        .order('created_at', { ascending: true });

      let customer: CustomerRow | null = null;
      if (orderRow.customer_id) {
        const { data: customerData } = await supabase
          .from('customers')
          .select('*')
          .eq('id', orderRow.customer_id)
          .single();
        customer = customerData;
      }

      orders.push(
        await parseOrder(
          orderRow,
          (itemsData as (OrderItemRow & { pieces: PieceRow })[]) ?? [],
          historyData ?? [],
          customer,
        ),
      );
    }

    return orders;
  },

  getByDateRange: async (startDate: Date, endDate: Date): Promise<Order[]> => {
    const { data: ordersData, error } = await supabase
      .from('orders')
      .select('*')
      .or(
        `pickup_date.gte.${formatDate(startDate)},delivery_date.gte.${formatDate(startDate)}`,
      )
      .or(
        `pickup_date.lte.${formatDate(endDate)},delivery_date.lte.${formatDate(endDate)}`,
      )
      .order('pickup_date', { ascending: true });

    if (error) throw error;

    const orders: Order[] = [];

    for (const orderRow of ordersData) {
      const { data: itemsData } = await supabase
        .from('order_items')
        .select('*, pieces(*)')
        .eq('order_id', orderRow.id);

      const { data: historyData } = await supabase
        .from('order_history')
        .select('*')
        .eq('order_id', orderRow.id)
        .order('created_at', { ascending: true });

      let customer: CustomerRow | null = null;
      if (orderRow.customer_id) {
        const { data: customerData } = await supabase
          .from('customers')
          .select('*')
          .eq('id', orderRow.customer_id)
          .single();
        customer = customerData;
      }

      orders.push(
        await parseOrder(
          orderRow,
          (itemsData as (OrderItemRow & { pieces: PieceRow })[]) ?? [],
          historyData ?? [],
          customer,
        ),
      );
    }

    return orders;
  },
};
