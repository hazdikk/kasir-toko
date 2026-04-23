package com.hazdik.kasirtoko.model.dto;

import java.math.BigDecimal;

public record ProductRequest(String name, BigDecimal price, int stock) {
}
