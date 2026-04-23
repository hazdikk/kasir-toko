package com.hazdik.kasirtoko.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record StockInRequest(
    @Positive int quantity,
    @NotNull @Positive BigDecimal unitPurchasePrice,
    @NotBlank String supplierId) {}
