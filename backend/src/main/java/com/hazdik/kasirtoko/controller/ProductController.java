package com.hazdik.kasirtoko.controller;

import com.hazdik.kasirtoko.model.dto.ProductRequest;
import com.hazdik.kasirtoko.model.dto.ProductResponse;
import com.hazdik.kasirtoko.service.ProductService;
import java.util.List;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
public class ProductController {

  private final ProductService productService;

  @GetMapping
  public List<ProductResponse> getAllProducts() {
    return productService.findAllProducts();
  }

  @GetMapping("/search")
  public List<ProductResponse> searchProducts(@RequestParam String q) {
    return productService.findProductsByQuery(q);
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

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void deleteProduct(@PathVariable String id) {
    productService.deleteProduct(id);
  }
}
