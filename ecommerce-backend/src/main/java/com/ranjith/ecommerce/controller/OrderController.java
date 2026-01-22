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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
@RequestMapping("/orders")
public class OrderController {

    @Autowired
    OrderService orderService;

    @Autowired
    UserRepo userRepo;

    @PostMapping("/checkout")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<OrderDetailDTO> checkout(
        @AuthenticationPrincipal UserDetails userDetails,
        @Valid @RequestBody OrderRequestDTO request
    ){

        User user = userRepo.findByUsername(userDetails.getUsername())
            .orElseThrow(() -> new UserNotFoundException("User not found"));
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.placeOrder(user,request.getShippingAddress()));
    }
    
    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Page<UserOrderSummaryDTO>> getMyOrders(
        @AuthenticationPrincipal UserDetails userDetails,
        @RequestParam(required = false) OrderStatus status,
        @RequestParam(required = false) BigDecimal minTotalAmount,
        @RequestParam(required = false) BigDecimal maxTotalAmount,
        Pageable pageable
    ){

        User user = userRepo.findByUsername(userDetails.getUsername())
            .orElseThrow(() -> new UserNotFoundException("User not found"));
        return ResponseEntity.ok(orderService.getOrdersByUser(user.getId(),status,minTotalAmount,maxTotalAmount,pageable));
    }

    @GetMapping("/{orderId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<OrderDetailDTO> getOrderById(@PathVariable Long orderId,@AuthenticationPrincipal UserDetails userDetails){

        User user = userRepo.findByUsername(userDetails.getUsername())
            .orElseThrow(() -> new UserNotFoundException("User not found"));
        return ResponseEntity.ok(orderService.getOrderById(orderId, user));
    }

    @PostMapping("/{orderId}/cancel")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<UserOrderSummaryDTO> cancelOrder(@PathVariable Long orderId,@AuthenticationPrincipal UserDetails userDetails){

        User user = userRepo.findByUsername(userDetails.getUsername())
            .orElseThrow(() -> new UserNotFoundException("User not found"));
    
        return ResponseEntity.ok(orderService.cancelOrder(orderId, user));
    }

    @PostMapping("/{orderId}/refund-request")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<UserOrderSummaryDTO> refundRequest(@PathVariable Long orderId,@AuthenticationPrincipal UserDetails userDetails){

        User user = userRepo.findByUsername(userDetails.getUsername())
            .orElseThrow(() -> new UserNotFoundException("User not found"));

        return ResponseEntity.ok(orderService.refundRequest(orderId,user));
    }
}
