package com.hazdik.kasirtoko.model.dto;

import com.hazdik.kasirtoko.model.entity.Product;

import java.math.BigDecimal;

public record ProductResponse(String id, String name, BigDecimal price, int stock) {

    public static ProductResponse from(Product product) {
        return new ProductResponse(product.getId(), product.getName(), product.getPrice(), product.getStock());
    }
}
