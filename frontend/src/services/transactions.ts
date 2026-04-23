import { apiFetch } from "./api";
import type { TransactionRequest, TransactionResponse } from "@/types";

export function createTransaction(data: TransactionRequest): Promise<TransactionResponse> {
  return apiFetch<TransactionResponse>("/transactions", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getTransactions(): Promise<TransactionResponse[]> {
  return apiFetch<TransactionResponse[]>("/transactions");
}

export function getTransaction(id: string): Promise<TransactionResponse> {
  return apiFetch<TransactionResponse>(`/transactions/${id}`);
}
