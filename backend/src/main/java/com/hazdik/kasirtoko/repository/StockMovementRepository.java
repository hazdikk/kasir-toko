package com.hazdik.kasirtoko.repository;

import com.hazdik.kasirtoko.model.entity.StockMovement;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StockMovementRepository extends JpaRepository<StockMovement, String> {}
