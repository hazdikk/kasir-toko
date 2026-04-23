package com.hazdik.kasirtoko.exception;

public class SupplierNotFoundException extends RuntimeException {

  public SupplierNotFoundException(String id) {
    super("Supplier not found: " + id);
  }
}
