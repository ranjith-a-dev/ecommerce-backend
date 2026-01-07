package com.ranjith.ecommerce.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ranjith.ecommerce.dto.PaymentResponseDTO;
import com.ranjith.ecommerce.entity.User;
import com.ranjith.ecommerce.exception.UserNotFoundException;
import com.ranjith.ecommerce.repository.UserRepo;
import com.ranjith.ecommerce.service.PaymentService;

@RestController
@RequestMapping("/payments")
public class PaymentController {

    @Autowired
    PaymentService paymentService;

    @Autowired
    UserRepo userRepo;

    @PreAuthorize("hasRole('USER')")
    @PostMapping("/initiate")
    public ResponseEntity<PaymentResponseDTO> initiatePayment(@RequestParam Long orderId,
        @AuthenticationPrincipal UserDetails userDetails){

        User user = userRepo.findByUsername(userDetails.getUsername())
            .orElseThrow(() -> new UserNotFoundException("User not found"));

        return ResponseEntity.ok(paymentService.initiatePayment(orderId, user));
    }

    @PreAuthorize("hasRole('USER')")
    @PostMapping("/success")
    public ResponseEntity<Void> markPaymentSuccess(@RequestParam String paymentRef){
        paymentService.markPaymentSuccess(paymentRef);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('USER')")
    @PostMapping("/failure")
    public ResponseEntity<Void> markPaymentFailure(@RequestParam String paymentRef){
        paymentService.markPaymentFailure(paymentRef);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/refund/initiate/{orderId}")
    public ResponseEntity<Void> initiateRefund(@PathVariable Long orderId){
        paymentService.initiateRefund(orderId);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/refund/complete/{orderId}")
    public ResponseEntity<Void> completeRefund(@PathVariable Long orderId){
        paymentService.completeRefund(orderId);
        return ResponseEntity.ok().build();
    }
}
