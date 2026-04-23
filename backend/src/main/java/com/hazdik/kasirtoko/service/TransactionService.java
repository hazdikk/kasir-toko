package com.hazdik.kasirtoko.service;

import com.hazdik.kasirtoko.exception.InsufficientStockException;
import com.hazdik.kasirtoko.exception.ProductNotFoundException;
import com.hazdik.kasirtoko.exception.TransactionNotFoundException;
import com.hazdik.kasirtoko.model.dto.TransactionItemRequest;
import com.hazdik.kasirtoko.model.dto.TransactionRequest;
import com.hazdik.kasirtoko.model.dto.TransactionResponse;
import com.hazdik.kasirtoko.model.entity.Product;
import com.hazdik.kasirtoko.model.entity.Transaction;
import com.hazdik.kasirtoko.model.entity.TransactionItem;
import com.hazdik.kasirtoko.repository.ProductRepository;
import com.hazdik.kasirtoko.repository.TransactionRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TransactionService {

  private final TransactionRepository transactionRepository;
  private final ProductRepository productRepository;

  @Transactional
  public TransactionResponse createTransaction(TransactionRequest request) {
    List<String> productIds =
        request.items().stream().map(TransactionItemRequest::productId).toList();

    Map<String, Product> productMap =
        productRepository.findAllById(productIds).stream()
            .collect(Collectors.toMap(Product::getId, p -> p));

    for (TransactionItemRequest itemRequest : request.items()) {
      Product product =
          Optional.ofNullable(productMap.get(itemRequest.productId()))
              .orElseThrow(() -> new ProductNotFoundException(itemRequest.productId()));
      if (product.getStock() < itemRequest.quantity()) {
        throw new InsufficientStockException(
            product.getName(), product.getStock(), itemRequest.quantity());
      }
    }

    Transaction transaction = new Transaction();
    transaction.setPaymentMethod(request.paymentMethod());
    transaction.setAmountPaid(request.amountPaid());

    BigDecimal total = BigDecimal.ZERO;
    for (TransactionItemRequest itemRequest : request.items()) {
      Product product = productMap.get(itemRequest.productId());
      product.setStock(product.getStock() - itemRequest.quantity());

      TransactionItem item = new TransactionItem();
      item.setProduct(product);
      item.setQuantity(itemRequest.quantity());
      item.setUnitPurchasePrice(product.getPurchasePrice());
      item.setUnitSellingPrice(product.getSellingPrice());
      item.setTransaction(transaction);
      transaction.getItems().add(item);

      total =
          total.add(
              product.getSellingPrice().multiply(BigDecimal.valueOf(itemRequest.quantity())));
    }

    transaction.setTotalAmount(total);
    transaction.setChangeAmount(request.amountPaid().subtract(total));

    return TransactionResponse.from(transactionRepository.save(transaction));
  }

  public TransactionResponse findTransaction(String id) {
    return transactionRepository
        .findById(id)
        .map(TransactionResponse::from)
        .orElseThrow(() -> new TransactionNotFoundException(id));
  }

  public List<TransactionResponse> findAllTransactions() {
    return transactionRepository.findAll().stream().map(TransactionResponse::from).toList();
  }
}
