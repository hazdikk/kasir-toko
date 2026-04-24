package com.hazdik.kasirtoko.controller;

import com.hazdik.kasirtoko.model.dto.ProductPageResponse;
import com.hazdik.kasirtoko.model.dto.ProductRequest;
import com.hazdik.kasirtoko.model.dto.ProductResponse;
import com.hazdik.kasirtoko.model.dto.StockInRequest;
import com.hazdik.kasirtoko.service.ProductService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
public class ProductController {

  private final ProductService productService;

  @GetMapping
  public ProductPageResponse getAllProducts(
      @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "25") int size) {
    return productService.findAllProducts(PageRequest.of(page, size, Sort.by("name").ascending()));
  }

  @GetMapping("/search")
  public List<ProductResponse> searchProducts(@RequestParam String q) {
    return productService.findProductsByQuery(q);
  }

  @GetMapping("/categories")
  public List<String> getCategories() {
    return productService.findAllCategories();
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public ProductResponse createProduct(@Valid @RequestBody ProductRequest request) {
    return productService.createProduct(request);
  }

  @PutMapping("/{id}")
  public ProductResponse updateProduct(
      @PathVariable String id, @Valid @RequestBody ProductRequest request) {
    return productService.updateProduct(id, request);
  }

  @PostMapping("/{id}/stock-in")
  public ProductResponse stockInProduct(
      @PathVariable String id, @Valid @RequestBody StockInRequest request) {
    return productService.stockInProduct(id, request);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void deleteProduct(@PathVariable String id) {
    productService.deleteProduct(id);
  }
}
