package com.hazdik.kasirtoko.service;

import com.hazdik.kasirtoko.exception.ProductNotFoundException;
import com.hazdik.kasirtoko.model.dto.ProductRequest;
import com.hazdik.kasirtoko.model.dto.ProductResponse;
import com.hazdik.kasirtoko.model.entity.Product;
import com.hazdik.kasirtoko.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public List<ProductResponse> findAllProducts() {
        return productRepository.findAll().stream()
                .map(ProductResponse::from)
                .toList();
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        Product product = new Product();
        product.setBarcode(request.barcode());
        product.setName(request.name());
        product.setPrice(request.price());
        product.setStock(request.stock());
        return ProductResponse.from(productRepository.save(product));
    }

    @Transactional
    public ProductResponse updateProduct(String id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));
        product.setBarcode(request.barcode());
        product.setName(request.name());
        product.setPrice(request.price());
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
