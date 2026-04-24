export interface Product {
  id: string;
  barcode?: string;
  name: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
}

export interface ProductRequest {
  barcode?: string;
  name: string;
  category: string;
  sellingPrice: number;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export type ProductPage = PageResponse<Product>;

export interface StockInRequest {
  quantity: number;
  unitPurchasePrice: number;
  supplierId: string;
}

export interface Supplier {
  id: string;
  companyName: string;
  senderName: string;
  phoneNumber: string;
}

export interface SupplierRequest {
  companyName: string;
  senderName: string;
  phoneNumber: string;
}

export type PaymentMethod = "CASH";

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

export interface AuthUser {
  username: string;
}
