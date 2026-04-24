package com.hazdik.kasirtoko.integration;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hazdik.kasirtoko.repository.ProductRepository;
import com.hazdik.kasirtoko.repository.StockMovementRepository;
import com.hazdik.kasirtoko.repository.SupplierRepository;
import com.hazdik.kasirtoko.repository.TransactionRepository;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
    properties = {"app.security.username=owner", "app.security.password=password"})
@AutoConfigureMockMvc
@Transactional
public abstract class BaseIntegrationTest {

  @Autowired protected MockMvc mockMvc;
  @Autowired private ProductRepository productRepository;
  @Autowired private StockMovementRepository stockMovementRepository;
  @Autowired private SupplierRepository supplierRepository;
  @Autowired private TransactionRepository transactionRepository;

  private final ObjectMapper objectMapper = new ObjectMapper();
  protected MockHttpSession authenticatedSession;

  @BeforeEach
  void cleanDatabase() {
    transactionRepository.deleteAll();
    stockMovementRepository.deleteAll();
    productRepository.deleteAll();
    supplierRepository.deleteAll();
    authenticatedSession = login();
  }

  protected String asJsonString(Object value) {
    try {
      return objectMapper.writeValueAsString(value);
    } catch (JsonProcessingException exception) {
      throw new IllegalArgumentException("Failed to serialize test payload", exception);
    }
  }

  protected <T> T readResponseBody(String content, TypeReference<T> responseType) {
    try {
      return objectMapper.readValue(content, responseType);
    } catch (JsonProcessingException exception) {
      throw new IllegalArgumentException("Failed to deserialize response body", exception);
    }
  }

  protected <T> T getApi(String path, TypeReference<T> responseType) throws Exception {
    MvcResult mvcResult =
        mockMvc
            .perform(get(path).session(authenticatedSession).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andReturn();
    return readResponseBody(mvcResult.getResponse().getContentAsString(), responseType);
  }

  protected <T> T postApi(
      String path, Object requestBody, int expectedStatus, TypeReference<T> responseType)
      throws Exception {
    MvcResult mvcResult =
        mockMvc
            .perform(
                post(path)
                    .session(authenticatedSession)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .content(asJsonString(requestBody)))
            .andExpect(status().is(expectedStatus))
            .andReturn();
    return readResponseBody(mvcResult.getResponse().getContentAsString(), responseType);
  }

  protected <T> T putApi(String path, Object requestBody, TypeReference<T> responseType)
      throws Exception {
    MvcResult mvcResult =
        mockMvc
            .perform(
                put(path)
                    .session(authenticatedSession)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .content(asJsonString(requestBody)))
            .andExpect(status().isOk())
            .andReturn();
    return readResponseBody(mvcResult.getResponse().getContentAsString(), responseType);
  }

  protected void deleteApi(String path, int expectedStatus) throws Exception {
    mockMvc
        .perform(
            delete(path)
                .session(authenticatedSession)
                .with(csrf())
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().is(expectedStatus));
  }

  private MockHttpSession login() {
    try {
      MvcResult mvcResult =
          mockMvc
              .perform(
                  post("/auth/login")
                      .contentType(MediaType.APPLICATION_JSON)
                      .accept(MediaType.APPLICATION_JSON)
                      .content(asJsonString(Map.of("username", "owner", "password", "password"))))
              .andExpect(status().isOk())
              .andReturn();
      return (MockHttpSession) mvcResult.getRequest().getSession(false);
    } catch (Exception exception) {
      throw new IllegalStateException("Failed to authenticate integration test session", exception);
    }
  }
}
