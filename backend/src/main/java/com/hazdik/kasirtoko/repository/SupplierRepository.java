package com.hazdik.kasirtoko.repository;

import com.hazdik.kasirtoko.model.entity.Supplier;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupplierRepository extends JpaRepository<Supplier, String> {
  List<Supplier> findByCompanyNameContainingIgnoreCaseOrSenderNameContainingIgnoreCase(
      String companyName, String senderName);
}
