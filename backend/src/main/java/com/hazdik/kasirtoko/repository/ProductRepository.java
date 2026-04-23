package com.hazdik.kasirtoko.repository;

import com.hazdik.kasirtoko.model.entity.Product;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, String> {
  Optional<Product> findByBarcode(String barcode);

  List<Product> findByNameContainingIgnoreCase(String name);
}
