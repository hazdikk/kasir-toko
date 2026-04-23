package com.hazdik.kasirtoko.integration.support;

import com.hazdik.kasirtoko.model.entity.Product;
import com.hazdik.kasirtoko.model.entity.Supplier;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public final class TestFixtures {

  private TestFixtures() {}

  public static Product aProduct(
      String barcode,
      String name,
      String category,
      String purchasePrice,
      String sellingPrice,
      int stock) {
    Product product = new Product();
    product.setBarcode(barcode);
    product.setName(name);
    product.setCategory(category);
    product.setPurchasePrice(new BigDecimal(purchasePrice));
    product.setSellingPrice(new BigDecimal(sellingPrice));
    product.setStock(stock);
    return product;
  }

  public static Map<String, Object> aProductRequest(
      String barcode,
      String name,
      String category,
      String purchasePrice,
      String sellingPrice,
      int stock) {
    return Map.of(
        "barcode", barcode,
        "name", name,
        "category", category,
        "purchasePrice", new BigDecimal(purchasePrice),
        "sellingPrice", new BigDecimal(sellingPrice),
        "stock", stock);
  }

  public static Map<String, Object> aTransactionRequest(
      String productId, int quantity, String paymentMethod, String amountPaid) {
    return Map.of(
        "items",
        List.of(Map.of("productId", productId, "quantity", quantity)),
        "paymentMethod",
        paymentMethod,
        "amountPaid",
        new BigDecimal(amountPaid));
  }

  public static Map<String, Object> aStockInRequest(int quantity, String unitPurchasePrice) {
    return aStockInRequest(quantity, unitPurchasePrice, "supplier-id");
  }

  public static Map<String, Object> aStockInRequest(
      int quantity, String unitPurchasePrice, String supplierId) {
    return Map.of(
        "quantity",
        quantity,
        "unitPurchasePrice",
        new BigDecimal(unitPurchasePrice),
        "supplierId",
        supplierId);
  }

  public static Supplier aSupplier(String companyName, String senderName, String phoneNumber) {
    Supplier supplier = new Supplier();
    supplier.setCompanyName(companyName);
    supplier.setSenderName(senderName);
    supplier.setPhoneNumber(phoneNumber);
    return supplier;
  }

  public static Map<String, Object> aSupplierRequest(
      String companyName, String senderName, String phoneNumber) {
    return Map.of("companyName", companyName, "senderName", senderName, "phoneNumber", phoneNumber);
  }
}
