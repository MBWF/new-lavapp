import { createContext, useContext, useState, type ReactNode } from "react";
import type { Customer } from "@/types/customer";
import type { Piece } from "@/types/piece";
import type { DeliveryType } from "@/types/order";

export interface OrderItemDraft {
  piece: Piece;
  quantity: number;
  subtotal: number;
}

export interface OrderWizardData {
  customer: Customer | null;
  isAnonymous: boolean;
  items: OrderItemDraft[];
  deliveryType: DeliveryType;
  pickupDate: Date | null;
  pickupTime: string;
  deliveryDate: Date | null;
  deliveryTime: string;
  deliveryAddress: string;
  notes: string;
  specialInstructions: string;
}

interface OrderWizardContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  data: OrderWizardData;
  setCustomer: (customer: Customer | null, isAnonymous?: boolean) => void;
  addItem: (piece: Piece) => void;
  removeItem: (pieceId: string) => void;
  updateItemQuantity: (pieceId: string, quantity: number) => void;
  setDeliveryInfo: (info: Partial<OrderWizardData>) => void;
  getTotal: () => number;
  resetWizard: () => void;
  canProceed: () => boolean;
}

const initialData: OrderWizardData = {
  customer: null,
  isAnonymous: false,
  items: [],
  deliveryType: "PICKUP",
  pickupDate: null,
  pickupTime: "",
  deliveryDate: null,
  deliveryTime: "",
  deliveryAddress: "",
  notes: "",
  specialInstructions: "",
};

const OrderWizardContext = createContext<OrderWizardContextType | null>(null);

export function OrderWizardProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OrderWizardData>(initialData);

  const setCustomer = (customer: Customer | null, isAnonymous = false) => {
    setData((prev) => ({ ...prev, customer, isAnonymous }));
    if (customer || isAnonymous) {
      setCurrentStep(2);
    }
  };

  const addItem = (piece: Piece) => {
    setData((prev) => {
      const existingIndex = prev.items.findIndex((item) => item.piece.id === piece.id);
      if (existingIndex >= 0) {
        const newItems = [...prev.items];
        const existing = newItems[existingIndex]!;
        newItems[existingIndex] = {
          ...existing,
          quantity: existing.quantity + 1,
          subtotal: (existing.quantity + 1) * piece.price,
        };
        return { ...prev, items: newItems };
      }
      return {
        ...prev,
        items: [...prev.items, { piece, quantity: 1, subtotal: piece.price }],
      };
    });
  };

  const removeItem = (pieceId: string) => {
    setData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.piece.id !== pieceId),
    }));
  };

  const updateItemQuantity = (pieceId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(pieceId);
      return;
    }
    setData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.piece.id === pieceId
          ? { ...item, quantity, subtotal: quantity * item.piece.price }
          : item
      ),
    }));
  };

  const setDeliveryInfo = (info: Partial<OrderWizardData>) => {
    setData((prev) => ({ ...prev, ...info }));
  };

  const getTotal = () => {
    return data.items.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const resetWizard = () => {
    setCurrentStep(1);
    setData(initialData);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return data.customer !== null || data.isAnonymous;
      case 2:
        return data.items.length > 0;
      case 3:
        return (
          data.pickupDate !== null &&
          data.pickupTime !== "" &&
          data.deliveryDate !== null &&
          data.deliveryTime !== "" &&
          (data.deliveryType === "PICKUP" || data.deliveryAddress.trim() !== "")
        );
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <OrderWizardContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        data,
        setCustomer,
        addItem,
        removeItem,
        updateItemQuantity,
        setDeliveryInfo,
        getTotal,
        resetWizard,
        canProceed,
      }}
    >
      {children}
    </OrderWizardContext.Provider>
  );
}

export function useOrderWizard() {
  const context = useContext(OrderWizardContext);
  if (!context) {
    throw new Error("useOrderWizard must be used within an OrderWizardProvider");
  }
  return context;
}

