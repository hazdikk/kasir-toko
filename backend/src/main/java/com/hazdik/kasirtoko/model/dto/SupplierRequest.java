package com.hazdik.kasirtoko.model.dto;

import jakarta.validation.constraints.NotBlank;

public record SupplierRequest(
    @NotBlank String companyName, @NotBlank String senderName, @NotBlank String phoneNumber) {}
