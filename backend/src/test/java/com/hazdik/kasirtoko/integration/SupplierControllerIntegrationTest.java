package com.hazdik.kasirtoko.integration;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.core.type.TypeReference;
import com.hazdik.kasirtoko.integration.support.TestFixtures;
import com.hazdik.kasirtoko.repository.SupplierRepository;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class SupplierControllerIntegrationTest extends BaseIntegrationTest {

  @Autowired private SupplierRepository supplierRepository;

  @Test
  void createSupplier_validRequest_returnsCreatedSupplier() throws Exception {
    Map<String, Object> request =
        TestFixtures.aSupplierRequest("PT Sumber Makmur", "Budi Santoso", "08123456789");

    Map<String, Object> response = postApi("/suppliers", request, 201, new TypeReference<>() {});

    assertThat(response.get("id")).isNotNull();
    assertThat(response.get("companyName")).isEqualTo("PT Sumber Makmur");
    assertThat(response.get("senderName")).isEqualTo("Budi Santoso");
    assertThat(response.get("phoneNumber")).isEqualTo("08123456789");
  }

  @Test
  void searchSuppliers_matchingSenderName_returnsFilteredSuppliers() throws Exception {
    supplierRepository.save(
        TestFixtures.aSupplier("PT Sumber Makmur", "Budi Santoso", "08123456789"));
    supplierRepository.save(TestFixtures.aSupplier("CV Jaya Abadi", "Siti Aminah", "08987654321"));

    List<Map<String, Object>> response =
        getApi("/suppliers/search?q=budi", new TypeReference<>() {});

    assertThat(response).hasSize(1);
    assertThat(response.getFirst().get("companyName")).isEqualTo("PT Sumber Makmur");
    assertThat(response.getFirst().get("senderName")).isEqualTo("Budi Santoso");
    assertThat(response.getFirst().get("phoneNumber")).isEqualTo("08123456789");
  }

  @Test
  void searchSuppliers_matchingCompanyName_returnsFilteredSuppliers() throws Exception {
    supplierRepository.save(
        TestFixtures.aSupplier("PT Sumber Makmur", "Budi Santoso", "08123456789"));
    supplierRepository.save(TestFixtures.aSupplier("CV Jaya Abadi", "Siti Aminah", "08987654321"));

    List<Map<String, Object>> response =
        getApi("/suppliers/search?q=jaya", new TypeReference<>() {});

    assertThat(response).hasSize(1);
    assertThat(response.getFirst().get("companyName")).isEqualTo("CV Jaya Abadi");
    assertThat(response.getFirst().get("senderName")).isEqualTo("Siti Aminah");
    assertThat(response.getFirst().get("phoneNumber")).isEqualTo("08987654321");
  }

  @Test
  void createSupplier_blankFields_returns400() throws Exception {
    Map<String, Object> request = TestFixtures.aSupplierRequest("", "", "");

    Map<String, Object> response = postApi("/suppliers", request, 400, new TypeReference<>() {});

    @SuppressWarnings("unchecked")
    Map<String, Object> errors = (Map<String, Object>) response.get("errors");
    assertThat(errors.get("companyName")).isEqualTo("must not be blank");
    assertThat(errors.get("senderName")).isEqualTo("must not be blank");
    assertThat(errors.get("phoneNumber")).isEqualTo("must not be blank");
  }
}
