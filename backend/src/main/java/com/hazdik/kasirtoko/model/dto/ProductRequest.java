package com.hazdik.kasirtoko.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record ProductRequest(
    String barcode,
    @NotBlank String name,
    @NotBlank String category,
    @NotNull @Positive BigDecimal sellingPrice) {}
