package com.hazdik.kasirtoko.model.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record ProductRequest(
    String barcode,
    @NotBlank String name,
    @NotNull @Positive BigDecimal price,
    @Min(0) int stock) {}
