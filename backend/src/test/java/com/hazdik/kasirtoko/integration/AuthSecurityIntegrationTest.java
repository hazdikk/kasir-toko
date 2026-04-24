package com.hazdik.kasirtoko.integration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.core.type.TypeReference;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

class AuthSecurityIntegrationTest extends BaseIntegrationTest {

  @Test
  void protectedEndpoints_unauthenticatedRequest_returnsUnauthorized() throws Exception {
    mockMvc
        .perform(get("/products").accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isUnauthorized());
    mockMvc
        .perform(get("/suppliers").accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isUnauthorized());
    mockMvc
        .perform(get("/transactions").accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void login_validCredentials_returnsCurrentUser() throws Exception {
    MvcResult mvcResult =
        mockMvc
            .perform(
                post("/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .content(asJsonString(Map.of("username", "owner", "password", "password"))))
            .andExpect(status().isOk())
            .andReturn();

    Map<String, Object> response =
        readResponseBody(mvcResult.getResponse().getContentAsString(), new TypeReference<>() {});

    assertThat(response.get("username")).isEqualTo("owner");
    assertThat(mvcResult.getRequest().getSession(false)).isNotNull();
  }

  @Test
  void login_invalidCredentials_returnsUnauthorized() throws Exception {
    MvcResult mvcResult =
        mockMvc
            .perform(
                post("/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .content(asJsonString(Map.of("username", "owner", "password", "wrong"))))
            .andExpect(status().isUnauthorized())
            .andReturn();

    Map<String, Object> response =
        readResponseBody(mvcResult.getResponse().getContentAsString(), new TypeReference<>() {});

    assertThat(response.get("detail")).isEqualTo("Invalid username or password");
  }

  @Test
  void logout_authenticatedSession_invalidatesSession() throws Exception {
    mockMvc
        .perform(post("/auth/logout").session(authenticatedSession).with(csrf()))
        .andExpect(status().isOk());

    mockMvc
        .perform(get("/auth/me").session(authenticatedSession).accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void protectedMutation_missingCsrf_returnsForbidden() throws Exception {
    mockMvc
        .perform(
            post("/products")
                .session(authenticatedSession)
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .content(
                    asJsonString(
                        Map.of(
                            "barcode", "SKU-9001",
                            "name", "Kopi",
                            "category", "Minuman",
                            "purchasePrice", "5000",
                            "sellingPrice", "7000",
                            "stock", 10))))
        .andExpect(status().isForbidden());
  }

  @Test
  void csrf_authenticatedSession_returnsToken() throws Exception {
    MvcResult mvcResult =
        mockMvc
            .perform(
                get("/auth/csrf").session(authenticatedSession).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andReturn();

    Map<String, Object> response =
        readResponseBody(mvcResult.getResponse().getContentAsString(), new TypeReference<>() {});

    assertThat(response.get("headerName")).isEqualTo("X-CSRF-TOKEN");
    assertThat(response.get("token")).isNotNull();
  }

  @Test
  void cors_allowedOrigin_returnsCorsHeaders() throws Exception {
    mockMvc
        .perform(
            options("/products")
                .header(HttpHeaders.ORIGIN, "http://localhost:3000")
                .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "GET"))
        .andExpect(status().isOk())
        .andExpect(
            result ->
                assertThat(result.getResponse().getHeader(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN))
                    .isEqualTo("http://localhost:3000"));
  }

  @Test
  void cors_unconfiguredOrigin_returnsForbidden() throws Exception {
    mockMvc
        .perform(
            options("/products")
                .header(HttpHeaders.ORIGIN, "https://evil.example")
                .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "GET"))
        .andExpect(status().isForbidden());
  }
}
