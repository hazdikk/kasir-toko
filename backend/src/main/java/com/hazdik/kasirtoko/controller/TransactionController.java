package com.hazdik.kasirtoko.controller;

import com.hazdik.kasirtoko.model.dto.TransactionRequest;
import com.hazdik.kasirtoko.model.dto.TransactionResponse;
import com.hazdik.kasirtoko.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TransactionResponse createTransaction(@RequestBody TransactionRequest request) {
        return transactionService.createTransaction(request);
    }

    @GetMapping("/{id}")
    public TransactionResponse getTransaction(@PathVariable String id) {
        return transactionService.findTransaction(id);
    }

    @GetMapping
    public List<TransactionResponse> getAllTransactions() {
        return transactionService.findAllTransactions();
    }
}
