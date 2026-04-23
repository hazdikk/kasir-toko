package com.hazdik.kasirtoko.model.dto;

import com.hazdik.kasirtoko.model.entity.Supplier;

public record SupplierResponse(
    String id, String companyName, String senderName, String phoneNumber) {

  public static SupplierResponse from(Supplier supplier) {
    return new SupplierResponse(
        supplier.getId(),
        supplier.getCompanyName(),
        supplier.getSenderName(),
        supplier.getPhoneNumber());
  }
}
