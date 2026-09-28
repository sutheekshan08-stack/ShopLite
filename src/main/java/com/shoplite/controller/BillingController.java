package com.shoplite.controller;

import com.shoplite.dto.BillRequest;
import com.shoplite.entity.Bill;
import com.shoplite.service.BillingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/billing")
public class BillingController {

    private final BillingService billingService;

    public BillingController(BillingService billingService) {
        this.billingService = billingService;
    }

    // Create a new bill
    @PostMapping
    public ResponseEntity<Bill> createBill(
            @RequestBody BillRequest request) {

        return ResponseEntity.ok(
                billingService.createBill(request)
        );
    }

    // Finalize a bill and reduce stock
    @PostMapping("/{id}/finalize")
    public ResponseEntity<Bill> finalizeBill(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                billingService.finalizeBill(id)
        );
    }
}