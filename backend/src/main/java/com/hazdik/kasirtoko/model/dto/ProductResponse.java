package com.hazdik.kasirtoko.model.dto;

import com.hazdik.kasirtoko.model.entity.Product;
import java.math.BigDecimal;

public record ProductResponse(
    String id,
    String barcode,
    String name,
    BigDecimal purchasePrice,
    BigDecimal sellingPrice,
    int stock) {

  public static ProductResponse from(Product product) {
    return new ProductResponse(
        product.getId(),
        product.getBarcode(),
        product.getName(),
        product.getPurchasePrice(),
        product.getSellingPrice(),
        product.getStock());
  }
}
