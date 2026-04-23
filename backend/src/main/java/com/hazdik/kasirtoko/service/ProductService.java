package com.hazdik.kasirtoko.service;

import com.hazdik.kasirtoko.exception.ProductNotFoundException;
import com.hazdik.kasirtoko.model.dto.ProductRequest;
import com.hazdik.kasirtoko.model.dto.ProductResponse;
import com.hazdik.kasirtoko.model.dto.StockInRequest;
import com.hazdik.kasirtoko.model.entity.Product;
import com.hazdik.kasirtoko.model.entity.StockMovement;
import com.hazdik.kasirtoko.repository.ProductRepository;
import com.hazdik.kasirtoko.repository.StockMovementRepository;
import java.math.BigDecimal;
import java.math.MathContext;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProductService {

  private final ProductRepository productRepository;
  private final StockMovementRepository stockMovementRepository;

  public List<ProductResponse> findProductsByQuery(String query) {
    return productRepository
        .findByNameContainingIgnoreCaseOrBarcodeContainingIgnoreCase(query, query)
        .stream()
        .collect(
            Collectors.toMap(
                Product::getId, product -> product, (left, right) -> left, LinkedHashMap::new))
        .values()
        .stream()
        .map(ProductResponse::from)
        .toList();
  }

  public List<ProductResponse> findAllProducts() {
    return productRepository.findAll().stream().map(ProductResponse::from).toList();
  }

  @Transactional
  public ProductResponse createProduct(ProductRequest request) {
    Product product = new Product();
    product.setBarcode(request.barcode());
    product.setName(request.name());
    product.setPurchasePrice(request.purchasePrice());
    product.setSellingPrice(request.sellingPrice());
    product.setStock(request.stock());
    return ProductResponse.from(productRepository.save(product));
  }

  @Transactional
  public ProductResponse updateProduct(String id, ProductRequest request) {
    Product product =
        productRepository.findById(id).orElseThrow(() -> new ProductNotFoundException(id));
    product.setBarcode(request.barcode());
    product.setName(request.name());
    product.setPurchasePrice(request.purchasePrice());
    product.setSellingPrice(request.sellingPrice());
    product.setStock(request.stock());
    return ProductResponse.from(productRepository.save(product));
  }

  @Transactional
  public ProductResponse stockInProduct(String id, StockInRequest request) {
    Product product =
        productRepository.findByIdForUpdate(id).orElseThrow(() -> new ProductNotFoundException(id));

    int stockBefore = product.getStock();
    int stockAfter = stockBefore + request.quantity();

    BigDecimal newPurchasePrice =
        calculateNewPurchasePrice(
            product.getPurchasePrice(), stockBefore, request.unitPurchasePrice(), request.quantity(), stockAfter);

    product.setStock(stockAfter);
    product.setPurchasePrice(newPurchasePrice);

    StockMovement stockMovement = new StockMovement();
    stockMovement.setProduct(product);
    stockMovement.setQuantity(request.quantity());
    stockMovement.setUnitPurchasePrice(request.unitPurchasePrice());
    stockMovement.setStockBefore(stockBefore);
    stockMovement.setStockAfter(stockAfter);

    stockMovementRepository.save(stockMovement);
    return ProductResponse.from(productRepository.save(product));
  }

  @Transactional
  public void deleteProduct(String id) {
    if (!productRepository.existsById(id)) {
      throw new ProductNotFoundException(id);
    }
    productRepository.deleteById(id);
  }

  private BigDecimal calculateNewPurchasePrice(
      BigDecimal currentPurchasePrice,
      int currentStock,
      BigDecimal incomingUnitPurchasePrice,
      int incomingQuantity,
      int totalStock) {
    if (currentStock == 0 || currentPurchasePrice == null) {
      return incomingUnitPurchasePrice;
    }

    BigDecimal currentStockValue = currentPurchasePrice.multiply(BigDecimal.valueOf(currentStock));
    BigDecimal incomingStockValue =
        incomingUnitPurchasePrice.multiply(BigDecimal.valueOf(incomingQuantity));

    return currentStockValue
        .add(incomingStockValue)
        .divide(BigDecimal.valueOf(totalStock), MathContext.DECIMAL64);
  }
}
