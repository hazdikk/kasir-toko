package com.hazdik.kasirtoko.model.dto;

import java.util.List;

public record ProductPageResponse(
    List<ProductResponse> content,
    int page,
    int size,
    long totalElements,
    int totalPages,
    boolean last) {}
