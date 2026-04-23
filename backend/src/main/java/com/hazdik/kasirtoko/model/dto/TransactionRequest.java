package com.hazdik.kasirtoko.model.dto;

import com.hazdik.kasirtoko.model.enums.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.util.List;

public record TransactionRequest(
    @NotEmpty @Valid List<TransactionItemRequest> items,
    @NotNull PaymentMethod paymentMethod,
    @NotNull @Positive BigDecimal amountPaid) {}
