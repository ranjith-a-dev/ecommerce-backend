package com.ranjith.ecommerce.controller;

import java.math.BigDecimal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import com.ranjith.ecommerce.dto.OrderDetailDTO;
import com.ranjith.ecommerce.dto.OrderRequestDTO;
import com.ranjith.ecommerce.dto.UserOrderSummaryDTO;
import com.ranjith.ecommerce.entity.User;
import com.ranjith.ecommerce.enums.OrderStatus;
import com.ranjith.ecommerce.exception.UserNotFoundException;
import com.ranjith.ecommerce.repository.UserRepo;
import com.ranjith.ecommerce.service.OrderService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserRepo userRepo;

    /* ====================== CHECKOUT ====================== */

    @PostMapping("/checkout")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<OrderDetailDTO> checkout(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody OrderRequestDTO request
    ) {
        User user = userRepo.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(orderService.placeOrder(user, request));
    }

    /* ====================== GET MY ORDERS ====================== */

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Page<UserOrderSummaryDTO>> getMyOrders(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) BigDecimal minTotalAmount,
            @RequestParam(required = false) BigDecimal maxTotalAmount,
            Pageable pageable
    ) {
        User user = userRepo.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        return ResponseEntity.ok(
                orderService.getOrdersByUser(user.getId(), status, minTotalAmount, maxTotalAmount, pageable)
        );
    }

    /* ====================== GET ORDER DETAILS ====================== */

    @GetMapping("/{orderId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<OrderDetailDTO> getOrderById(
            @PathVariable Long orderId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepo.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        return ResponseEntity.ok(orderService.getOrderById(orderId, user));
    }

    /* ====================== CANCEL ORDER (USER) ====================== */

    @PostMapping("/{orderId}/cancel")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<UserOrderSummaryDTO> cancelOrder(
            @PathVariable Long orderId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepo.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        return ResponseEntity.ok(orderService.cancelOrder(orderId, user));
    }

    /* ====================== REFUND REQUEST (USER) ====================== */

    @PostMapping("/{orderId}/refund-request")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<UserOrderSummaryDTO> refundRequest(
            @PathVariable Long orderId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepo.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        return ResponseEntity.ok(orderService.refundRequest(orderId, user));
    }

    /* ====================== ADMIN CANCEL ORDER ====================== */

    @PostMapping("/admin/{orderId}/cancel")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> cancelOrderByAdmin(@PathVariable Long orderId) {
        orderService.cancelOrderByAdmin(orderId);
        return ResponseEntity.ok("Order cancelled by admin successfully ✅");
    }
}
