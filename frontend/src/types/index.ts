export interface Product {
  id: string;
  barcode?: string;
  name: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
}

export interface ProductRequest {
  barcode?: string;
  name: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
}

export type PaymentMethod = "CASH" | "CARD";

export interface TransactionItemRequest {
  productId: string;
  quantity: number;
}

export interface TransactionRequest {
  items: TransactionItemRequest[];
  paymentMethod: PaymentMethod;
  amountPaid: number;
}

export interface TransactionItemResponse {
  productId: string;
  productName: string;
  quantity: number;
  unitPurchasePrice: number;
  unitSellingPrice: number;
  subtotal: number;
}

export interface TransactionResponse {
  id: string;
  createdAt: string;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  amountPaid: number;
  changeAmount: number;
  items: TransactionItemResponse[];
}
