import { apiFetch } from "./api";
import type { Product, ProductRequest } from "@/types";

export function getProducts(): Promise<Product[]> {
  return apiFetch<Product[]>("/products");
}

export function createProduct(data: ProductRequest): Promise<Product> {
  return apiFetch<Product>("/products", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateProduct(id: string, data: ProductRequest): Promise<Product> {
  return apiFetch<Product>(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteProduct(id: string): Promise<void> {
  return apiFetch<void>(`/products/${id}`, { method: "DELETE" });
}

export function searchProducts(name: string): Promise<Product[]> {
  return apiFetch<Product[]>(`/products/search?name=${encodeURIComponent(name)}`);
}

export function getProductByBarcode(barcode: string): Promise<Product> {
  return apiFetch<Product>(`/products/barcode/${encodeURIComponent(barcode)}`);
}
