package com.hazdik.kasirtoko.model.dto;

import com.hazdik.kasirtoko.model.enums.PaymentMethod;

import java.math.BigDecimal;
import java.util.List;

public record TransactionRequest(List<TransactionItemRequest> items, PaymentMethod paymentMethod, BigDecimal amountPaid) {
}
