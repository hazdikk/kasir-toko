package com.hazdik.kasirtoko.repository;

import com.hazdik.kasirtoko.model.entity.Product;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, String> {
  List<Product> findByNameContainingIgnoreCaseOrBarcodeContainingIgnoreCaseOrCategoryContainingIgnoreCase(
      String name, String barcode, String category);

  @Query("select p.category from Product p where p.category is not null")
  List<String> findAllCategories();

  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select p from Product p where p.id = :id")
  Optional<Product> findByIdForUpdate(@Param("id") String id);
}
