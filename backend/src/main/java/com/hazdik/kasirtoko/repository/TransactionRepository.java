package com.hazdik.kasirtoko.repository;

import com.hazdik.kasirtoko.model.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionRepository extends JpaRepository<Transaction, String> {}
