package com.hazdik.kasirtoko.model.dto;

import com.hazdik.kasirtoko.model.entity.TransactionItem;

import java.math.BigDecimal;

public record TransactionItemResponse(String productId, String productName, int quantity, BigDecimal unitPrice, BigDecimal subtotal) {

    public static TransactionItemResponse from(TransactionItem item) {
        return new TransactionItemResponse(
                item.getProduct().getId(),
                item.getProduct().getName(),
                item.getQuantity(),
                item.getUnitPrice(),
                item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()))
        );
    }
}
