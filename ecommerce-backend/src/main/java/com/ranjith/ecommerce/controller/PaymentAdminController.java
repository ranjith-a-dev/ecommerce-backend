package com.ranjith.ecommerce.controller;

import java.math.BigDecimal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ranjith.ecommerce.dto.PaymentResponseDTO;
import com.ranjith.ecommerce.enums.PaymentStatus;
import com.ranjith.ecommerce.service.PaymentService;

@RestController
@RequestMapping("/api/admin/payments")
public class PaymentAdminController {

    @Autowired
    PaymentService paymentService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<Page<PaymentResponseDTO>> getAllPayments(
        @RequestParam(required = false) Long userId,
        @RequestParam(required = false) PaymentStatus status,
        @RequestParam(required = false) BigDecimal minAmount,
        @RequestParam(required = false) BigDecimal maxAmount,
        Pageable pageable
    ){
        return ResponseEntity.ok(paymentService.getAllPayments(userId,status,minAmount,maxAmount,pageable));
    }
}
