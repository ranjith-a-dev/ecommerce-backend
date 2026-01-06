package com.ranjith.ecommerce.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ranjith.ecommerce.dto.OrderSummaryDTO;
import com.ranjith.ecommerce.enums.OrderStatus;
import com.ranjith.ecommerce.service.OrderService;

@RestController
@RequestMapping("/admin/orders")
public class AdminOrderController {
    
    @Autowired
    OrderService orderService;

    @PutMapping("/{orderId}/status")
    public ResponseEntity<OrderSummaryDTO> updateOrderStatus(@PathVariable Long orderId,@RequestParam OrderStatus status){
        return ResponseEntity.ok(orderService.updateOrderStatus(orderId, status));
    }

    @GetMapping
    public ResponseEntity<List<OrderSummaryDTO>> getAllOrders(){
        return ResponseEntity.ok(orderService.getAllOrders());
    }
}
