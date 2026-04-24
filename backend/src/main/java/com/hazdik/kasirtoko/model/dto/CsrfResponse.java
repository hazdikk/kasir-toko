package com.hazdik.kasirtoko.model.dto;

public record CsrfResponse(String headerName, String parameterName, String token) {}
