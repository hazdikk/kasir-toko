package com.hazdik.kasirtoko.repository;

import com.hazdik.kasirtoko.model.entity.Product;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, String> {
  List<Product> findByNameContainingIgnoreCaseOrBarcodeContainingIgnoreCase(
      String name, String barcode);
}
