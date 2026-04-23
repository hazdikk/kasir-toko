package com.hazdik.kasirtoko.service;

import com.hazdik.kasirtoko.model.dto.SupplierRequest;
import com.hazdik.kasirtoko.model.dto.SupplierResponse;
import com.hazdik.kasirtoko.model.entity.Supplier;
import com.hazdik.kasirtoko.repository.SupplierRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SupplierService {

  private final SupplierRepository supplierRepository;

  public List<SupplierResponse> findAllSuppliers() {
    return supplierRepository.findAll().stream().map(SupplierResponse::from).toList();
  }

  public List<SupplierResponse> findSuppliersByQuery(String query) {
    return supplierRepository
        .findByCompanyNameContainingIgnoreCaseOrSenderNameContainingIgnoreCase(query, query)
        .stream()
        .map(SupplierResponse::from)
        .toList();
  }

  @Transactional
  public SupplierResponse createSupplier(SupplierRequest request) {
    Supplier supplier = new Supplier();
    supplier.setCompanyName(request.companyName());
    supplier.setSenderName(request.senderName());
    supplier.setPhoneNumber(request.phoneNumber());
    return SupplierResponse.from(supplierRepository.save(supplier));
  }
}
