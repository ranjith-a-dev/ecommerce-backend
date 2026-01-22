package com.ranjith.ecommerce.controller;

import java.math.BigDecimal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ranjith.ecommerce.dto.AdminOrderSummaryDTO;
import com.ranjith.ecommerce.dto.UserOrderSummaryDTO;
import com.ranjith.ecommerce.enums.OrderStatus;
import com.ranjith.ecommerce.service.OrderService;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@RestController
@RequestMapping("api/admin/orders")
@Validated
public class AdminOrderController {
    
    @Autowired
    OrderService orderService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<Page<AdminOrderSummaryDTO>> getAllOrders(
        @RequestParam(required = false) Long userId,
        @RequestParam(required = false) OrderStatus status,
        @RequestParam(required = false) BigDecimal minTotalAmount,
        @RequestParam(required = false) BigDecimal maxTotalAmount,
        @RequestParam(required = false) Boolean refundRequested,
        Pageable pageable
    ){
        return ResponseEntity.ok(orderService.getAllOrders(userId,status,minTotalAmount,maxTotalAmount,refundRequested,pageable));
    }
    
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{orderId}/status")
    public ResponseEntity<UserOrderSummaryDTO> updateOrderStatus(
        @PathVariable
        @NotNull(message = "Order ID is required")
        @Positive(message = "Order ID must be positive")
        Long orderId,
        
        @RequestParam
        @NotNull(message = "Order status is required")
        OrderStatus status){
            
        return ResponseEntity.ok(orderService.updateOrderStatus(orderId, status));
    }
}
