package com.hazdik.kasirtoko.integration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.core.type.TypeReference;
import com.hazdik.kasirtoko.integration.support.TestFixtures;
import com.hazdik.kasirtoko.model.entity.Product;
import com.hazdik.kasirtoko.model.entity.StockMovement;
import com.hazdik.kasirtoko.repository.ProductRepository;
import com.hazdik.kasirtoko.repository.StockMovementRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class ProductControllerIntegrationTest extends BaseIntegrationTest {

  @Autowired private ProductRepository productRepository;
  @Autowired private StockMovementRepository stockMovementRepository;

  @Test
  void findAllProducts_existingProducts_returnsProductList() throws Exception {
    productRepository.save(TestFixtures.aProduct("SKU-1001", "Kopi", "5000", "7000", 10));

    List<Map<String, Object>> response = getApi("/products", new TypeReference<>() {});

    assertThat(response).hasSize(1);
    assertThat(response.getFirst().get("barcode")).isEqualTo("SKU-1001");
    assertThat(response.getFirst().get("name")).isEqualTo("Kopi");
    assertThat(decimalOf(response.getFirst().get("purchasePrice"))).isEqualByComparingTo("5000");
    assertThat(decimalOf(response.getFirst().get("sellingPrice"))).isEqualByComparingTo("7000");
  }

  @Test
  void searchProducts_matchingName_returnsFilteredProducts() throws Exception {
    productRepository.save(TestFixtures.aProduct("SKU-1002", "Teh Botol", "3000", "4500", 8));
    productRepository.save(TestFixtures.aProduct("SKU-1003", "Susu", "7000", "10000", 5));

    List<Map<String, Object>> response =
        getApi("/products/search?q=teh", new TypeReference<>() {});

    assertThat(response).hasSize(1);
    assertThat(response.getFirst().get("barcode")).isEqualTo("SKU-1002");
    assertThat(response.getFirst().get("name")).isEqualTo("Teh Botol");
  }

  @Test
  void searchProducts_partialBarcode_returnsMatchedProducts() throws Exception {
    productRepository.save(TestFixtures.aProduct("SKU-1008", "Kerupuk", "2000", "3500", 11));
    productRepository.save(TestFixtures.aProduct("SKU-1009", "Keripik", "2500", "4000", 7));
    productRepository.save(TestFixtures.aProduct("ABC-2001", "Rengginang", "3000", "4500", 5));

    List<Map<String, Object>> response =
        getApi("/products/search?q=SKU-100", new TypeReference<>() {});

    assertThat(response).hasSize(2);
    assertThat(response).extracting(item -> item.get("barcode")).containsExactlyInAnyOrder("SKU-1008", "SKU-1009");
  }

  @Test
  void searchProducts_nameAndBarcodeMatchSameProduct_returnsUniqueProduct() throws Exception {
    productRepository.save(
        TestFixtures.aProduct("SKU-1010", "Paket SKU-1010", "8000", "11000", 4));

    List<Map<String, Object>> response =
        getApi("/products/search?q=SKU-1010", new TypeReference<>() {});

    assertThat(response).hasSize(1);
    assertThat(response.getFirst().get("barcode")).isEqualTo("SKU-1010");
    assertThat(response.getFirst().get("name")).isEqualTo("Paket SKU-1010");
  }

  @Test
  void searchProducts_missingQueryParam_returnsBadRequest() throws Exception {
    mockMvc.perform(get("/products/search")).andExpect(status().isBadRequest());
  }

  @Test
  void createProduct_validRequest_returnsCreatedProduct() throws Exception {
    Map<String, Object> request =
        TestFixtures.aProductRequest("SKU-1005", "Biskuit", "3500", "5500", 15);

    Map<String, Object> response =
        postApi("/products", request, 201, new TypeReference<>() {});

    assertThat(response.get("id")).isNotNull();
    assertThat(response.get("barcode")).isEqualTo("SKU-1005");
    assertThat(response.get("name")).isEqualTo("Biskuit");
    assertThat(decimalOf(response.get("purchasePrice"))).isEqualByComparingTo("3500");
    assertThat(decimalOf(response.get("sellingPrice"))).isEqualByComparingTo("5500");
    assertThat(response.get("stock")).isEqualTo(15);
  }

  @Test
  void updateProduct_existingProduct_returnsUpdatedProduct() throws Exception {
    Product product =
        productRepository.save(TestFixtures.aProduct("SKU-1006", "Permen", "1000", "2000", 20));
    Map<String, Object> request =
        TestFixtures.aProductRequest("SKU-1006", "Permen Mint", "1200", "2500", 18);

    Map<String, Object> response =
        putApi("/products/" + product.getId(), request, new TypeReference<>() {});

    assertThat(response.get("id")).isEqualTo(product.getId());
    assertThat(response.get("name")).isEqualTo("Permen Mint");
    assertThat(decimalOf(response.get("purchasePrice"))).isEqualByComparingTo("1200");
    assertThat(decimalOf(response.get("sellingPrice"))).isEqualByComparingTo("2500");
    assertThat(response.get("stock")).isEqualTo(18);
  }

  @Test
  void deleteProduct_existingProduct_removesProductFromDatabase() throws Exception {
    Product product =
        productRepository.save(TestFixtures.aProduct("SKU-1007", "Mie Instan", "2500", "3500", 30));

    deleteApi("/products/" + product.getId(), 204);

    assertThat(productRepository.findById(product.getId())).isEmpty();
  }

  @Test
  void stockIn_validRequest_updatesStockAndWeightedPurchasePrice() throws Exception {
    Product product =
        productRepository.save(TestFixtures.aProduct("SKU-1011", "Sarden", "10000", "14000", 10));
    Map<String, Object> request = TestFixtures.aStockInRequest(5, "13000");

    Map<String, Object> response =
        postApi("/products/" + product.getId() + "/stock-in", request, 200, new TypeReference<>() {});

    assertThat(response.get("id")).isEqualTo(product.getId());
    assertThat(response.get("stock")).isEqualTo(15);
    assertThat(decimalOf(response.get("purchasePrice"))).isEqualByComparingTo("11000");
    assertThat(decimalOf(response.get("sellingPrice"))).isEqualByComparingTo("14000");
  }

  @Test
  void stockIn_productNotFound_returns404() throws Exception {
    Map<String, Object> request = TestFixtures.aStockInRequest(5, "13000");

    Map<String, Object> response =
        postApi("/products/missing-id/stock-in", request, 404, new TypeReference<>() {});

    assertThat(response.get("detail")).isEqualTo("Product not found: missing-id");
  }

  @Test
  void stockIn_invalidQuantity_returns400() throws Exception {
    Product product =
        productRepository.save(TestFixtures.aProduct("SKU-1012", "Kecap", "8000", "10000", 7));
    Map<String, Object> request = TestFixtures.aStockInRequest(0, "9000");

    Map<String, Object> response =
        postApi("/products/" + product.getId() + "/stock-in", request, 400, new TypeReference<>() {});

    @SuppressWarnings("unchecked")
    Map<String, Object> errors = (Map<String, Object>) response.get("errors");
    assertThat(errors.get("quantity")).isEqualTo("must be greater than 0");
  }

  @Test
  void stockIn_invalidUnitPurchasePrice_returns400() throws Exception {
    Product product =
        productRepository.save(TestFixtures.aProduct("SKU-1013", "Garam", "3000", "5000", 12));
    Map<String, Object> request = TestFixtures.aStockInRequest(2, "0");

    Map<String, Object> response =
        postApi("/products/" + product.getId() + "/stock-in", request, 400, new TypeReference<>() {});

    @SuppressWarnings("unchecked")
    Map<String, Object> errors = (Map<String, Object>) response.get("errors");
    assertThat(errors.get("unitPurchasePrice")).isEqualTo("must be greater than 0");
  }

  @Test
  void stockIn_zeroExistingStock_setsPurchasePriceToIncomingPrice() throws Exception {
    Product product =
        productRepository.save(TestFixtures.aProduct("SKU-1014", "Kornet", "9000", "12000", 0));
    Map<String, Object> request = TestFixtures.aStockInRequest(4, "7500");

    Map<String, Object> response =
        postApi("/products/" + product.getId() + "/stock-in", request, 200, new TypeReference<>() {});

    assertThat(response.get("stock")).isEqualTo(4);
    assertThat(decimalOf(response.get("purchasePrice"))).isEqualByComparingTo("7500");
  }

  @Test
  void stockIn_validRequest_persistsStockHistoryRecord() throws Exception {
    Product product =
        productRepository.save(TestFixtures.aProduct("SKU-1015", "Wafer", "6000", "9000", 3));
    Map<String, Object> request = TestFixtures.aStockInRequest(6, "7000");

    postApi("/products/" + product.getId() + "/stock-in", request, 200, new TypeReference<>() {});

    List<StockMovement> stockMovements = stockMovementRepository.findAll();
    assertThat(stockMovements).hasSize(1);
    StockMovement stockMovement = stockMovements.getFirst();
    assertThat(stockMovement.getProduct().getId()).isEqualTo(product.getId());
    assertThat(stockMovement.getQuantity()).isEqualTo(6);
    assertThat(stockMovement.getUnitPurchasePrice()).isEqualByComparingTo("7000");
    assertThat(stockMovement.getStockBefore()).isEqualTo(3);
    assertThat(stockMovement.getStockAfter()).isEqualTo(9);
  }

  @Test
  void stockIn_searchResultProductId_canBeUsedForStockIn() throws Exception {
    productRepository.save(TestFixtures.aProduct("SKU-1016", "Sosis", "4000", "6500", 5));

    List<Map<String, Object>> searchResponse =
        getApi("/products/search?q=SKU-1016", new TypeReference<>() {});

    assertThat(searchResponse).hasSize(1);
    String productId = searchResponse.getFirst().get("id").toString();

    Map<String, Object> stockInResponse =
        postApi(
            "/products/" + productId + "/stock-in",
            TestFixtures.aStockInRequest(3, "5000"),
            200,
            new TypeReference<>() {});

    assertThat(stockInResponse.get("id")).isEqualTo(productId);
    assertThat(stockInResponse.get("stock")).isEqualTo(8);
  }

  private BigDecimal decimalOf(Object value) {
    return new BigDecimal(value.toString());
  }
}
