package com.hazdik.kasirtoko.model.dto;

import com.hazdik.kasirtoko.model.entity.Transaction;
import com.hazdik.kasirtoko.model.enums.PaymentMethod;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record TransactionResponse(
    String id,
    LocalDateTime createdAt,
    PaymentMethod paymentMethod,
    BigDecimal totalAmount,
    BigDecimal amountPaid,
    BigDecimal changeAmount,
    List<TransactionItemResponse> items) {

  public static TransactionResponse from(Transaction transaction) {
    List<TransactionItemResponse> itemResponses =
        transaction.getItems().stream().map(TransactionItemResponse::from).toList();
    return new TransactionResponse(
        transaction.getId(),
        transaction.getCreatedAt(),
        transaction.getPaymentMethod(),
        transaction.getTotalAmount(),
        transaction.getAmountPaid(),
        transaction.getChangeAmount(),
        itemResponses);
  }
}
