package com.hazdik.kasirtoko.integration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.core.type.TypeReference;
import com.hazdik.kasirtoko.integration.support.TestFixtures;
import com.hazdik.kasirtoko.model.entity.Product;
import com.hazdik.kasirtoko.model.entity.StockMovement;
import com.hazdik.kasirtoko.model.entity.Supplier;
import com.hazdik.kasirtoko.repository.ProductRepository;
import com.hazdik.kasirtoko.repository.StockMovementRepository;
import com.hazdik.kasirtoko.repository.SupplierRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class ProductControllerIntegrationTest extends BaseIntegrationTest {

  @Autowired private ProductRepository productRepository;
  @Autowired private StockMovementRepository stockMovementRepository;
  @Autowired private SupplierRepository supplierRepository;

  @Test
  void findAllProducts_existingProducts_returnsPagedProductList() throws Exception {
    productRepository.save(
        TestFixtures.aProduct("SKU-1001", "Kopi", "Minuman", "5000", "7000", 10));

    Map<String, Object> response = getApi("/products", new TypeReference<>() {});
    List<Map<String, Object>> products = productsOf(response);

    assertThat(products).hasSize(1);
    assertThat(products.getFirst().get("barcode")).isEqualTo("SKU-1001");
    assertThat(products.getFirst().get("name")).isEqualTo("Kopi");
    assertThat(products.getFirst().get("category")).isEqualTo("Minuman");
    assertThat(decimalOf(products.getFirst().get("purchasePrice"))).isEqualByComparingTo("5000");
    assertThat(decimalOf(products.getFirst().get("sellingPrice"))).isEqualByComparingTo("7000");
    assertThat(response.get("page")).isEqualTo(0);
    assertThat(response.get("size")).isEqualTo(25);
    assertThat(response.get("totalElements")).isEqualTo(1);
    assertThat(response.get("totalPages")).isEqualTo(1);
    assertThat(response.get("last")).isEqualTo(true);
  }

  @Test
  void findAllProducts_withPageAndSize_returnsRequestedPage() throws Exception {
    productRepository.save(
        TestFixtures.aProduct("SKU-1031", "Apel", "Buah", "5000", "8000", 10));
    productRepository.save(
        TestFixtures.aProduct("SKU-1032", "Beras", "Sembako", "50000", "62000", 10));
    productRepository.save(
        TestFixtures.aProduct("SKU-1033", "Cabai", "Sayur", "12000", "15000", 10));

    Map<String, Object> response = getApi("/products?page=1&size=2", new TypeReference<>() {});
    List<Map<String, Object>> products = productsOf(response);

    assertThat(products).hasSize(1);
    assertThat(products.getFirst().get("name")).isEqualTo("Cabai");
    assertThat(response.get("page")).isEqualTo(1);
    assertThat(response.get("size")).isEqualTo(2);
    assertThat(response.get("totalElements")).isEqualTo(3);
    assertThat(response.get("totalPages")).isEqualTo(2);
    assertThat(response.get("last")).isEqualTo(true);
  }

  @Test
  void searchProducts_matchingName_returnsFilteredProducts() throws Exception {
    productRepository.save(
        TestFixtures.aProduct("SKU-1002", "Teh Botol", "Minuman", "3000", "4500", 8));
    productRepository.save(
        TestFixtures.aProduct("SKU-1003", "Susu", "Minuman", "7000", "10000", 5));

    List<Map<String, Object>> response = getApi("/products/search?q=teh", new TypeReference<>() {});

    assertThat(response).hasSize(1);
    assertThat(response.getFirst().get("barcode")).isEqualTo("SKU-1002");
    assertThat(response.getFirst().get("name")).isEqualTo("Teh Botol");
  }

  @Test
  void searchProducts_partialBarcode_returnsMatchedProducts() throws Exception {
    productRepository.save(
        TestFixtures.aProduct("SKU-1008", "Kerupuk", "Snack", "2000", "3500", 11));
    productRepository.save(
        TestFixtures.aProduct("SKU-1009", "Keripik", "Snack", "2500", "4000", 7));
    productRepository.save(
        TestFixtures.aProduct("ABC-2001", "Rengginang", "Snack", "3000", "4500", 5));

    List<Map<String, Object>> response =
        getApi("/products/search?q=SKU-100", new TypeReference<>() {});

    assertThat(response).hasSize(2);
    assertThat(response)
        .extracting(item -> item.get("barcode"))
        .containsExactlyInAnyOrder("SKU-1008", "SKU-1009");
  }

  @Test
  void searchProducts_nameAndBarcodeMatchSameProduct_returnsUniqueProduct() throws Exception {
    productRepository.save(
        TestFixtures.aProduct("SKU-1010", "Paket SKU-1010", "Paket", "8000", "11000", 4));

    List<Map<String, Object>> response =
        getApi("/products/search?q=SKU-1010", new TypeReference<>() {});

    assertThat(response).hasSize(1);
    assertThat(response.getFirst().get("barcode")).isEqualTo("SKU-1010");
    assertThat(response.getFirst().get("name")).isEqualTo("Paket SKU-1010");
  }

  @Test
  void searchProducts_matchingCategory_returnsFilteredProducts() throws Exception {
    productRepository.save(
        TestFixtures.aProduct("SKU-2001", "Apel Fuji", "Buah", "8000", "12000", 15));
    productRepository.save(
        TestFixtures.aProduct("SKU-2002", "Pisang", "Buah", "5000", "7000", 20));
    productRepository.save(
        TestFixtures.aProduct("SKU-2003", "Keripik", "Snack", "3000", "5000", 10));

    List<Map<String, Object>> response = getApi("/products/search?q=buah", new TypeReference<>() {});

    assertThat(response).hasSize(2);
    assertThat(response)
        .extracting(item -> item.get("barcode"))
        .containsExactlyInAnyOrder("SKU-2001", "SKU-2002");
  }

  @Test
  void searchProducts_missingQueryParam_returnsBadRequest() throws Exception {
    mockMvc
        .perform(get("/products/search").session(authenticatedSession))
        .andExpect(status().isBadRequest());
  }

  @Test
  void createProduct_validRequest_returnsCreatedProduct() throws Exception {
    Map<String, Object> request =
        TestFixtures.aProductRequest("SKU-1005", "Biskuit", "Snack", "5500");

    Map<String, Object> response = postApi("/products", request, 201, new TypeReference<>() {});

    assertThat(response.get("id")).isNotNull();
    assertThat(response.get("barcode")).isEqualTo("SKU-1005");
    assertThat(response.get("name")).isEqualTo("Biskuit");
    assertThat(response.get("category")).isEqualTo("SNACK");
    assertThat(decimalOf(response.get("purchasePrice"))).isEqualByComparingTo("0");
    assertThat(decimalOf(response.get("sellingPrice"))).isEqualByComparingTo("5500");
    assertThat(response.get("stock")).isEqualTo(0);
  }

  @Test
  void createProduct_existingCategoryDifferentCase_returnsUppercaseCategory() throws Exception {
    productRepository.save(
        TestFixtures.aProduct("SKU-1017", "Es Teh", "Minuman", "2000", "4000", 10));

    Map<String, Object> response =
        postApi(
            "/products",
            TestFixtures.aProductRequest("SKU-1018", "Jus Jeruk", "mINUMAN", "9000"),
            201,
            new TypeReference<>() {});

    assertThat(response.get("category")).isEqualTo("MINUMAN");
  }

  @Test
  void updateProduct_existingProduct_returnsUpdatedProduct() throws Exception {
    Product product =
        productRepository.save(
            TestFixtures.aProduct("SKU-1006", "Permen", "Permen", "1000", "2000", 20));
    Map<String, Object> request =
        TestFixtures.aProductRequest("SKU-1006", "Permen Mint", "Candy", "2500");

    Map<String, Object> response =
        putApi("/products/" + product.getId(), request, new TypeReference<>() {});

    assertThat(response.get("id")).isEqualTo(product.getId());
    assertThat(response.get("name")).isEqualTo("Permen Mint");
    assertThat(response.get("category")).isEqualTo("CANDY");
    assertThat(decimalOf(response.get("purchasePrice"))).isEqualByComparingTo("1000");
    assertThat(decimalOf(response.get("sellingPrice"))).isEqualByComparingTo("2500");
    assertThat(response.get("stock")).isEqualTo(20);
  }

  @Test
  void updateProduct_existingCategoryDifferentCase_returnsUppercaseCategory() throws Exception {
    productRepository.save(
        TestFixtures.aProduct("SKU-1019", "Cokelat", "Snack", "3000", "5000", 12));
    Product product =
        productRepository.save(
            TestFixtures.aProduct("SKU-1020", "Roti", "Bakery", "4000", "6500", 6));

    Map<String, Object> response =
        putApi(
            "/products/" + product.getId(),
            TestFixtures.aProductRequest("SKU-1020", "Roti Cokelat", "sNack", "6800"),
            new TypeReference<>() {});

    assertThat(response.get("category")).isEqualTo("SNACK");
  }

  @Test
  void deleteProduct_existingProduct_removesProductFromDatabase() throws Exception {
    Product product =
        productRepository.save(
            TestFixtures.aProduct("SKU-1007", "Mie Instan", "Makanan", "2500", "3500", 30));

    deleteApi("/products/" + product.getId(), 204);

    assertThat(productRepository.findById(product.getId())).isEmpty();
  }

  @Test
  void stockIn_validRequest_updatesStockAndWeightedPurchasePrice() throws Exception {
    Product product =
        productRepository.save(
            TestFixtures.aProduct("SKU-1011", "Sarden", "Makanan", "10000", "14000", 10));
    Supplier supplier = saveSupplier();
    Map<String, Object> request = TestFixtures.aStockInRequest(5, "13000", supplier.getId());

    Map<String, Object> response =
        postApi(
            "/products/" + product.getId() + "/stock-in", request, 200, new TypeReference<>() {});

    assertThat(response.get("id")).isEqualTo(product.getId());
    assertThat(response.get("stock")).isEqualTo(15);
    assertThat(decimalOf(response.get("purchasePrice"))).isEqualByComparingTo("11000");
    assertThat(decimalOf(response.get("sellingPrice"))).isEqualByComparingTo("14000");
  }

  @Test
  void stockIn_productNotFound_returns404() throws Exception {
    Supplier supplier = saveSupplier();
    Map<String, Object> request = TestFixtures.aStockInRequest(5, "13000", supplier.getId());

    Map<String, Object> response =
        postApi("/products/missing-id/stock-in", request, 404, new TypeReference<>() {});

    assertThat(response.get("detail")).isEqualTo("Product not found: missing-id");
  }

  @Test
  void stockIn_invalidQuantity_returns400() throws Exception {
    Product product =
        productRepository.save(
            TestFixtures.aProduct("SKU-1012", "Kecap", "Bumbu", "8000", "10000", 7));
    Supplier supplier = saveSupplier();
    Map<String, Object> request = TestFixtures.aStockInRequest(0, "9000", supplier.getId());

    Map<String, Object> response =
        postApi(
            "/products/" + product.getId() + "/stock-in", request, 400, new TypeReference<>() {});

    @SuppressWarnings("unchecked")
    Map<String, Object> errors = (Map<String, Object>) response.get("errors");
    assertThat(errors.get("quantity")).isEqualTo("must be greater than 0");
  }

  @Test
  void stockIn_invalidUnitPurchasePrice_returns400() throws Exception {
    Product product =
        productRepository.save(
            TestFixtures.aProduct("SKU-1013", "Garam", "Bumbu", "3000", "5000", 12));
    Supplier supplier = saveSupplier();
    Map<String, Object> request = TestFixtures.aStockInRequest(2, "0", supplier.getId());

    Map<String, Object> response =
        postApi(
            "/products/" + product.getId() + "/stock-in", request, 400, new TypeReference<>() {});

    @SuppressWarnings("unchecked")
    Map<String, Object> errors = (Map<String, Object>) response.get("errors");
    assertThat(errors.get("unitPurchasePrice")).isEqualTo("must be greater than 0");
  }

  @Test
  void stockIn_zeroExistingStock_setsPurchasePriceToIncomingPrice() throws Exception {
    Product product =
        productRepository.save(
            TestFixtures.aProduct("SKU-1014", "Kornet", "Makanan", "9000", "12000", 0));
    Supplier supplier = saveSupplier();
    Map<String, Object> request = TestFixtures.aStockInRequest(4, "7500", supplier.getId());

    Map<String, Object> response =
        postApi(
            "/products/" + product.getId() + "/stock-in", request, 200, new TypeReference<>() {});

    assertThat(response.get("stock")).isEqualTo(4);
    assertThat(decimalOf(response.get("purchasePrice"))).isEqualByComparingTo("7500");
  }

  @Test
  void stockIn_validRequest_persistsStockHistoryRecord() throws Exception {
    Product product =
        productRepository.save(
            TestFixtures.aProduct("SKU-1015", "Wafer", "Snack", "6000", "9000", 3));
    Supplier supplier = saveSupplier();
    Map<String, Object> request = TestFixtures.aStockInRequest(6, "7000", supplier.getId());

    postApi("/products/" + product.getId() + "/stock-in", request, 200, new TypeReference<>() {});

    List<StockMovement> stockMovements = stockMovementRepository.findAll();
    assertThat(stockMovements).hasSize(1);
    StockMovement stockMovement = stockMovements.getFirst();
    assertThat(stockMovement.getProduct().getId()).isEqualTo(product.getId());
    assertThat(stockMovement.getSupplier().getId()).isEqualTo(supplier.getId());
    assertThat(stockMovement.getQuantity()).isEqualTo(6);
    assertThat(stockMovement.getUnitPurchasePrice()).isEqualByComparingTo("7000");
    assertThat(stockMovement.getStockBefore()).isEqualTo(3);
    assertThat(stockMovement.getStockAfter()).isEqualTo(9);
  }

  @Test
  void stockIn_supplierNotFound_returns404() throws Exception {
    Product product =
        productRepository.save(
            TestFixtures.aProduct("SKU-1024", "Tepung", "Bahan", "5000", "7000", 9));
    Map<String, Object> request = TestFixtures.aStockInRequest(2, "5500", "missing-supplier-id");

    Map<String, Object> response =
        postApi(
            "/products/" + product.getId() + "/stock-in", request, 404, new TypeReference<>() {});

    assertThat(response.get("detail")).isEqualTo("Supplier not found: missing-supplier-id");
  }

  @Test
  void stockIn_blankSupplierId_returns400() throws Exception {
    Product product =
        productRepository.save(
            TestFixtures.aProduct("SKU-1025", "Saus", "Bumbu", "7000", "10000", 6));
    Map<String, Object> request = TestFixtures.aStockInRequest(2, "7500", "");

    Map<String, Object> response =
        postApi(
            "/products/" + product.getId() + "/stock-in", request, 400, new TypeReference<>() {});

    @SuppressWarnings("unchecked")
    Map<String, Object> errors = (Map<String, Object>) response.get("errors");
    assertThat(errors.get("supplierId")).isEqualTo("must not be blank");
  }

  @Test
  void stockIn_searchResultProductId_canBeUsedForStockIn() throws Exception {
    productRepository.save(
        TestFixtures.aProduct("SKU-1016", "Sosis", "Makanan", "4000", "6500", 5));

    List<Map<String, Object>> searchResponse =
        getApi("/products/search?q=SKU-1016", new TypeReference<>() {});

    assertThat(searchResponse).hasSize(1);
    String productId = searchResponse.getFirst().get("id").toString();
    Supplier supplier = saveSupplier();

    Map<String, Object> stockInResponse =
        postApi(
            "/products/" + productId + "/stock-in",
            TestFixtures.aStockInRequest(3, "5000", supplier.getId()),
            200,
            new TypeReference<>() {});

    assertThat(stockInResponse.get("id")).isEqualTo(productId);
    assertThat(stockInResponse.get("stock")).isEqualTo(8);
  }

  @Test
  void getCategories_existingProducts_returnsDistinctSortedCategories() throws Exception {
    productRepository.save(
        TestFixtures.aProduct("SKU-1021", "Susu UHT", "Minuman", "7000", "9000", 20));
    productRepository.save(TestFixtures.aProduct("SKU-1022", "Teh", "mINUMAN", "3000", "5000", 30));
    productRepository.save(
        TestFixtures.aProduct("SKU-1023", "Keripik", "Snack", "4000", "6000", 16));

    List<String> response = getApi("/products/categories", new TypeReference<>() {});

    assertThat(response).containsExactly("MINUMAN", "SNACK");
  }

  private BigDecimal decimalOf(Object value) {
    return new BigDecimal(value.toString());
  }

  @SuppressWarnings("unchecked")
  private List<Map<String, Object>> productsOf(Map<String, Object> response) {
    return (List<Map<String, Object>>) response.get("content");
  }

  private Supplier saveSupplier() {
    return supplierRepository.save(
        TestFixtures.aSupplier("PT Sumber Makmur", "Budi Santoso", "08123456789"));
  }
}
