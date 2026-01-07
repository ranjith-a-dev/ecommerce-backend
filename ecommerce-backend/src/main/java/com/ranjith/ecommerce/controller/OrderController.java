package com.ranjith.ecommerce.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ranjith.ecommerce.dto.OrderDetailDTO;
import com.ranjith.ecommerce.dto.OrderSummaryDTO;
import com.ranjith.ecommerce.entity.User;
import com.ranjith.ecommerce.exception.UserNotFoundException;
import com.ranjith.ecommerce.repository.UserRepo;
import com.ranjith.ecommerce.service.OrderService;

@RestController
@RequestMapping("/orders")
public class OrderController {

    @Autowired
    OrderService orderService;

    @Autowired
    UserRepo userRepo;

    @PostMapping("/checkout")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<OrderDetailDTO> checkout(@AuthenticationPrincipal UserDetails userDetails){

        User user = userRepo.findByUsername(userDetails.getUsername())
            .orElseThrow(() -> new UserNotFoundException("User not found"));
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.placeOrder(user));
    }
    
    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<OrderSummaryDTO>> getMyOrders(@AuthenticationPrincipal UserDetails userDetails){

        User user = userRepo.findByUsername(userDetails.getUsername())
            .orElseThrow(() -> new UserNotFoundException("User not found"));
        return ResponseEntity.ok(orderService.getOrdersByUser(user.getId()));
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
    public ResponseEntity<OrderSummaryDTO> cancelOrder(@PathVariable Long orderId,@AuthenticationPrincipal UserDetails userDetails){

        User user = userRepo.findByUsername(userDetails.getUsername())
            .orElseThrow(() -> new UserNotFoundException("User not found"));
    
        return ResponseEntity.ok(orderService.cancelOrder(orderId, user));
    }

    @PostMapping("/{orderId}/refund-request")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<OrderSummaryDTO> refundRequest(@PathVariable Long orderId,@AuthenticationPrincipal UserDetails userDetails){

        User user = userRepo.findByUsername(userDetails.getUsername())
            .orElseThrow(() -> new UserNotFoundException("User not found"));

        return ResponseEntity.ok(orderService.refundRequest(orderId,user));
    }
}
