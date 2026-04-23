package com.hazdik.kasirtoko.controller;

import com.hazdik.kasirtoko.model.dto.SupplierRequest;
import com.hazdik.kasirtoko.model.dto.SupplierResponse;
import com.hazdik.kasirtoko.service.SupplierService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/suppliers")
@RequiredArgsConstructor
public class SupplierController {

  private final SupplierService supplierService;

  @GetMapping
  public List<SupplierResponse> getAllSuppliers() {
    return supplierService.findAllSuppliers();
  }

  @GetMapping("/search")
  public List<SupplierResponse> searchSuppliers(@RequestParam String q) {
    return supplierService.findSuppliersByQuery(q);
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public SupplierResponse createSupplier(@Valid @RequestBody SupplierRequest request) {
    return supplierService.createSupplier(request);
  }
}
