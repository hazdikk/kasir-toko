package com.hazdik.kasirtoko.model.dto;

import java.math.BigDecimal;

public record ProductRequest(String barcode, String name, BigDecimal price, int stock) {
}
