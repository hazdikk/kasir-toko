package com.hazdik.kasirtoko.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public record TransactionItemRequest(@NotBlank String productId, @Positive int quantity) {}
