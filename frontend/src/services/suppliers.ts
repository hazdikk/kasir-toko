import { apiFetch } from "./api";
import type { Supplier, SupplierRequest } from "@/types";

export function getSuppliers(): Promise<Supplier[]> {
  return apiFetch<Supplier[]>("/suppliers");
}

export function searchSuppliers(query: string): Promise<Supplier[]> {
  return apiFetch<Supplier[]>(`/suppliers/search?q=${encodeURIComponent(query)}`);
}

export function createSupplier(data: SupplierRequest): Promise<Supplier> {
  return apiFetch<Supplier>("/suppliers", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
