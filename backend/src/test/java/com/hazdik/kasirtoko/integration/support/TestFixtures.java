package com.hazdik.kasirtoko.integration.support;

import com.hazdik.kasirtoko.model.entity.Product;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public final class TestFixtures {

  private TestFixtures() {}

  public static Product aProduct(
      String barcode, String name, String purchasePrice, String sellingPrice, int stock) {
    Product product = new Product();
    product.setBarcode(barcode);
    product.setName(name);
    product.setPurchasePrice(new BigDecimal(purchasePrice));
    product.setSellingPrice(new BigDecimal(sellingPrice));
    product.setStock(stock);
    return product;
  }

  public static Map<String, Object> aProductRequest(
      String barcode, String name, String purchasePrice, String sellingPrice, int stock) {
    return Map.of(
        "barcode", barcode,
        "name", name,
        "purchasePrice", new BigDecimal(purchasePrice),
        "sellingPrice", new BigDecimal(sellingPrice),
        "stock", stock);
  }

  public static Map<String, Object> aTransactionRequest(
      String productId, int quantity, String paymentMethod, String amountPaid) {
    return Map.of(
        "items", List.of(Map.of("productId", productId, "quantity", quantity)),
        "paymentMethod", paymentMethod,
        "amountPaid", new BigDecimal(amountPaid));
  }
}
