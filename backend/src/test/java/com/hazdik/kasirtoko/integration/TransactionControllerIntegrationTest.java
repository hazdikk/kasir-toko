package com.hazdik.kasirtoko.integration;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.core.type.TypeReference;
import com.hazdik.kasirtoko.integration.support.TestFixtures;
import com.hazdik.kasirtoko.model.entity.Product;
import com.hazdik.kasirtoko.repository.ProductRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class TransactionControllerIntegrationTest extends BaseIntegrationTest {

  @Autowired private ProductRepository productRepository;

  @Test
  void createTransaction_validItems_returnsCreatedTransaction() throws Exception {
    Product product =
        productRepository.save(
            TestFixtures.aProduct("SKU-2001", "Minyak", "Sembako", "12000", "15000", 20));
    Map<String, Object> request =
        TestFixtures.aTransactionRequest(product.getId(), 2, "CASH", "40000");

    Map<String, Object> response =
        postApi("/transactions", request, 201, new TypeReference<>() {});
    Map<String, Object> firstItem = firstItem(response);

    assertThat(response.get("id")).isNotNull();
    assertThat(response.get("paymentMethod")).isEqualTo("CASH");
    assertThat(decimalOf(response.get("totalAmount"))).isEqualByComparingTo("30000");
    assertThat(decimalOf(response.get("amountPaid"))).isEqualByComparingTo("40000");
    assertThat(decimalOf(response.get("changeAmount"))).isEqualByComparingTo("10000");
    assertThat(decimalOf(firstItem.get("unitPurchasePrice"))).isEqualByComparingTo("12000");
    assertThat(decimalOf(firstItem.get("unitSellingPrice"))).isEqualByComparingTo("15000");
    assertThat(decimalOf(firstItem.get("subtotal"))).isEqualByComparingTo("30000");
  }

  @Test
  void findTransactionById_existingTransaction_returnsTransaction() throws Exception {
    Product product =
        productRepository.save(
            TestFixtures.aProduct("SKU-2002", "Sabun", "Perawatan", "3000", "5000", 50));
    Map<String, Object> created =
        postApi(
            "/transactions",
            TestFixtures.aTransactionRequest(product.getId(), 3, "CARD", "20000"),
            201,
            new TypeReference<>() {});

    Map<String, Object> response =
        getApi("/transactions/" + created.get("id"), new TypeReference<>() {});

    assertThat(response.get("id")).isEqualTo(created.get("id"));
    assertThat(response.get("paymentMethod")).isEqualTo("CARD");
    assertThat(decimalOf(response.get("totalAmount"))).isEqualByComparingTo("15000");
  }

  @Test
  void findAllTransactions_existingTransactions_returnsTransactionList() throws Exception {
    Product firstProduct =
        productRepository.save(
            TestFixtures.aProduct("SKU-2003", "Gula", "Sembako", "10000", "13000", 25));
    Product secondProduct =
        productRepository.save(
            TestFixtures.aProduct("SKU-2004", "Beras", "Sembako", "50000", "62000", 10));

    postApi(
        "/transactions",
        TestFixtures.aTransactionRequest(firstProduct.getId(), 1, "CASH", "15000"),
        201,
        new TypeReference<Map<String, Object>>() {});
    postApi(
        "/transactions",
        TestFixtures.aTransactionRequest(secondProduct.getId(), 1, "CARD", "70000"),
        201,
        new TypeReference<Map<String, Object>>() {});

    List<Map<String, Object>> response = getApi("/transactions", new TypeReference<>() {});

    assertThat(response).hasSize(2);
    assertThat(response).allSatisfy(transaction -> assertThat(transaction.get("id")).isNotNull());
    assertThat(response)
        .extracting(transaction -> transaction.get("paymentMethod"))
        .containsExactlyInAnyOrder("CASH", "CARD");
  }

  private BigDecimal decimalOf(Object value) {
    return new BigDecimal(value.toString());
  }

  @SuppressWarnings("unchecked")
  private Map<String, Object> firstItem(Map<String, Object> transaction) {
    List<Map<String, Object>> items = (List<Map<String, Object>>) transaction.get("items");
    return items.getFirst();
  }
}
