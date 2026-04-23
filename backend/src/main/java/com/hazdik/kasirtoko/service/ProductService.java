package com.hazdik.kasirtoko.service;

import com.hazdik.kasirtoko.exception.ProductNotFoundException;
import com.hazdik.kasirtoko.model.dto.ProductRequest;
import com.hazdik.kasirtoko.model.dto.ProductResponse;
import com.hazdik.kasirtoko.model.entity.Product;
import com.hazdik.kasirtoko.repository.ProductRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProductService {

  private final ProductRepository productRepository;

  public List<ProductResponse> findProductsByName(String name) {
    return productRepository.findByNameContainingIgnoreCase(name).stream()
        .map(ProductResponse::from)
        .toList();
  }

  public ProductResponse findProductByBarcode(String barcode) {
    return productRepository
        .findByBarcode(barcode)
        .map(ProductResponse::from)
        .orElseThrow(() -> new ProductNotFoundException(barcode));
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
  public void deleteProduct(String id) {
    if (!productRepository.existsById(id)) {
      throw new ProductNotFoundException(id);
    }
    productRepository.deleteById(id);
  }
}
