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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ranjith.ecommerce.dto.ApiResponseDTO;
import com.ranjith.ecommerce.dto.PaymentResponseDTO;
import com.ranjith.ecommerce.entity.User;
import com.ranjith.ecommerce.enums.PaymentStatus;
import com.ranjith.ecommerce.exception.UserNotFoundException;
import com.ranjith.ecommerce.repository.UserRepo;
import com.ranjith.ecommerce.service.PaymentService;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    PaymentService paymentService;

    @Autowired
    UserRepo userRepo;

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Page<PaymentResponseDTO>> getPayments(
        @AuthenticationPrincipal UserDetails userDetails,
        @RequestParam(required = false) PaymentStatus status,
        @RequestParam(required = false) BigDecimal minAmount,
        @RequestParam(required = false) BigDecimal maxAmount,
        Pageable pageable
    ){

        User user = userRepo.findByUsername(userDetails.getUsername())
            .orElseThrow(() -> new UserNotFoundException("User not found"));
        
        return ResponseEntity.ok(paymentService.getPayments(user,status,minAmount,maxAmount, pageable));
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping("/order/{orderId}")
    public ResponseEntity<PaymentResponseDTO> getPaymentByOrderId(
        @PathVariable Long orderId,
        @AuthenticationPrincipal UserDetails userDetails){

        User user = userRepo.findByUsername(userDetails.getUsername())
            .orElseThrow(() -> new UserNotFoundException("User not found"));

        return ResponseEntity.ok(paymentService.getPaymentByOrderId(orderId, user));
    }

    @PostMapping("/initiate")
    public ResponseEntity<PaymentResponseDTO> initiatePayment(@RequestParam Long orderId,
        @AuthenticationPrincipal UserDetails userDetails){

        User user = userRepo.findByUsername(userDetails.getUsername())
            .orElseThrow(() -> new UserNotFoundException("User not found"));

        return ResponseEntity.status(HttpStatus.CREATED)
            .body(paymentService.initiatePayment(orderId, user));
    }

    @PostMapping("/success")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ApiResponseDTO> markPaymentSuccess(@RequestParam String paymentRef){
        paymentService.markPaymentSuccess(paymentRef);
        return ResponseEntity.ok(new ApiResponseDTO("Payment marked as success"));
    }

    @PostMapping("/failure")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ApiResponseDTO> markPaymentFailure(@RequestParam String paymentRef){
        paymentService.markPaymentFailure(paymentRef);
        return ResponseEntity.ok(new ApiResponseDTO("Payment marked as failed"));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/refund/initiate/{orderId}")
    public ResponseEntity<ApiResponseDTO> initiateRefund(@PathVariable Long orderId){
        paymentService.initiateRefund(orderId);
        return ResponseEntity.ok(new ApiResponseDTO("Refund initiated successfully"));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/refund/complete/{orderId}")
    public ResponseEntity<ApiResponseDTO> completeRefund(@PathVariable Long orderId){
        paymentService.completeRefund(orderId);
        return ResponseEntity.ok(new ApiResponseDTO("Refund completed successfully"));
    }
}
