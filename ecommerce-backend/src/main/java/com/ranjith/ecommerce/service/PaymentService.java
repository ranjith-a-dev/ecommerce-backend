package com.ranjith.ecommerce.service;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ranjith.ecommerce.dto.PaymentResponseDTO;
import com.ranjith.ecommerce.entity.Order;
import com.ranjith.ecommerce.entity.OrderItem;
import com.ranjith.ecommerce.entity.Payment;
import com.ranjith.ecommerce.entity.Product;
import com.ranjith.ecommerce.entity.User;
import com.ranjith.ecommerce.enums.OrderStatus;
import com.ranjith.ecommerce.enums.PaymentStatus;
import com.ranjith.ecommerce.exception.OrderNotFoundException;
import com.ranjith.ecommerce.exception.PaymentAlreadyDoneException;
import com.ranjith.ecommerce.exception.PaymentNotFoundException;
import com.ranjith.ecommerce.exception.UnauthorizedUserException;
import com.ranjith.ecommerce.repository.OrderRepo;
import com.ranjith.ecommerce.repository.PaymentRepo;
import com.ranjith.ecommerce.repository.ProductRepo;
import com.ranjith.ecommerce.validation.OrderStatusValidator;

@Service
public class PaymentService {

    @Autowired
    private OrderRepo orderRepo;

    @Autowired
    private PaymentRepo paymentRepo;

    @Autowired
    private ProductRepo productRepo;

    @Autowired
    private OrderStatusValidator orderStatusValidator;

    public Page<PaymentResponseDTO> getPayments(
        User user,
        PaymentStatus status,
        BigDecimal minAmount,
        BigDecimal maxAmount,
        Pageable pageable
    ) {
        return paymentRepo.findUserPayments(user, status, minAmount, maxAmount, pageable)
            .map(this::mapToPaymentResponseDTO);
    }

    public Page<PaymentResponseDTO> getAllPayments(
        Long userId,
        PaymentStatus status,
        BigDecimal minAmount,
        BigDecimal maxAmount,
        Pageable pageable
    ){
        return paymentRepo.findAllPayments(userId, status, minAmount, maxAmount, pageable)
            .map(this::mapToPaymentResponseDTO);
    }

    @Transactional
    public PaymentResponseDTO initiatePayment(Long orderId, User user) {

        Order order = orderRepo.findById(orderId)
            .orElseThrow(() -> new OrderNotFoundException("Order not found"));

        if (!order.getUser().getId().equals(user.getId()))
            throw new UnauthorizedUserException("You are not authorized to pay this order");

        if (order.getStatus() == OrderStatus.CANCELLED ||
            order.getStatus() == OrderStatus.SHIPPED ||
            order.getStatus() == OrderStatus.DELIVERED ||
            order.getStatus() == OrderStatus.REFUND_INITIATED ||
            order.getStatus() == OrderStatus.REFUNDED) {
            throw new IllegalStateException("Order already closed. Payment not allowed.");
        }

        if (order.getStatus() == OrderStatus.PAID)
            throw new IllegalStateException("Order already PAID");

        Optional<Payment> existingPaymentOpt = paymentRepo.findByOrder(order);
        if (existingPaymentOpt.isPresent()) {

            if (order.getStatus() == OrderStatus.CREATED) {
                orderStatusValidator.validateStatusTransition(OrderStatus.CREATED, OrderStatus.PAYMENT_PENDING);
                order.setStatus(OrderStatus.PAYMENT_PENDING);
                orderRepo.saveAndFlush(order);
            }

            return mapToPaymentResponseDTO(existingPaymentOpt.get());
        }

        orderStatusValidator.validateStatusTransition(order.getStatus(), OrderStatus.PAYMENT_PENDING);
        order.setStatus(OrderStatus.PAYMENT_PENDING);

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setAmount(order.getTotalAmount());
        payment.setStatus(PaymentStatus.INITIATED);
        payment.setPaymentReference(UUID.randomUUID().toString());

        paymentRepo.saveAndFlush(payment);
        orderRepo.saveAndFlush(order);

        return mapToPaymentResponseDTO(payment);
    }

    @Transactional
    public void markPaymentSuccess(String paymentRef) {

        Payment payment = paymentRepo.findByPaymentReference(paymentRef)
            .orElseThrow(() -> new PaymentNotFoundException("Payment not found"));

        Order order = orderRepo.findById(payment.getOrder().getId())
            .orElseThrow(() -> new OrderNotFoundException("Order not found"));

        if (payment.getStatus() == PaymentStatus.SUCCESS && order.getStatus() == OrderStatus.PAID)
            return;

        if (order.getStatus() == OrderStatus.CANCELLED ||
            order.getStatus() == OrderStatus.SHIPPED ||
            order.getStatus() == OrderStatus.DELIVERED ||
            order.getStatus() == OrderStatus.REFUND_INITIATED ||
            order.getStatus() == OrderStatus.REFUNDED) {
            throw new IllegalStateException("Cannot mark payment success for closed order");
        }

        payment.setStatus(PaymentStatus.SUCCESS);
        paymentRepo.saveAndFlush(payment);

        if (order.getStatus() == OrderStatus.CREATED) {
            orderStatusValidator.validateStatusTransition(OrderStatus.CREATED, OrderStatus.PAYMENT_PENDING);
            order.setStatus(OrderStatus.PAYMENT_PENDING);
        }

        if (order.getStatus() == OrderStatus.PAYMENT_PENDING) {
            orderStatusValidator.validateStatusTransition(OrderStatus.PAYMENT_PENDING, OrderStatus.PAID);
            order.setStatus(OrderStatus.PAID);
        } else if (order.getStatus() != OrderStatus.PAID) {
            order.setStatus(OrderStatus.PAID);
        }

        orderRepo.saveAndFlush(order);
    }

    @Transactional
    public void markPaymentFailure(String paymentRef) {

        Payment payment = paymentRepo.findByPaymentReference(paymentRef)
            .orElseThrow(() -> new PaymentNotFoundException("Payment not found"));

        Order order = orderRepo.findById(payment.getOrder().getId())
            .orElseThrow(() -> new OrderNotFoundException("Order not found"));

        if (payment.getStatus() == PaymentStatus.FAILED)
            return;

        if (payment.getStatus() == PaymentStatus.SUCCESS)
            throw new IllegalStateException("Cannot mark failure after success");

        if (payment.getStatus() != PaymentStatus.INITIATED)
            throw new PaymentAlreadyDoneException("Payment already processed");

        payment.setStatus(PaymentStatus.FAILED);
        paymentRepo.saveAndFlush(payment);

        if (order.getStatus() == OrderStatus.CREATED) {
            orderStatusValidator.validateStatusTransition(OrderStatus.CREATED, OrderStatus.PAYMENT_PENDING);
            order.setStatus(OrderStatus.PAYMENT_PENDING);
            orderRepo.saveAndFlush(order);
        }
    }

    @Transactional
    public void initiateRefund(Long orderId) {

        Order order = orderRepo.findById(orderId)
            .orElseThrow(() -> new OrderNotFoundException("Order not found"));

        if (order.getStatus() != OrderStatus.PAID && order.getStatus() != OrderStatus.DELIVERED)
            throw new IllegalStateException("Refund initiation allowed only for PAID/DELIVERED orders");

        if (!order.isRefundRequested())
            throw new IllegalStateException("Refund not requested by user");

        orderStatusValidator.validateStatusTransition(order.getStatus(), OrderStatus.REFUND_INITIATED);

        Payment payment = paymentRepo.findByOrder(order)
            .orElseThrow(() -> new PaymentNotFoundException("Payment not found"));

        payment.setStatus(PaymentStatus.REFUND_INITIATED);
        order.setStatus(OrderStatus.REFUND_INITIATED);

        paymentRepo.saveAndFlush(payment);
        orderRepo.saveAndFlush(order);
    }

    @Transactional
    public void completeRefund(Long orderId) {

        Order order = orderRepo.findById(orderId)
            .orElseThrow(() -> new OrderNotFoundException("Order not found"));

        if (order.getStatus() != OrderStatus.REFUND_INITIATED)
            throw new IllegalStateException("Refund not initiated");

        orderStatusValidator.validateStatusTransition(order.getStatus(), OrderStatus.REFUNDED);

        Payment payment = paymentRepo.findByOrder(order)
            .orElseThrow(() -> new PaymentNotFoundException("Payment not found"));

        payment.setStatus(PaymentStatus.REFUNDED);
        order.setStatus(OrderStatus.REFUNDED);
        order.setRefundRequested(false);

        for (OrderItem orderItem : order.getOrderItems()) {
            Product product = orderItem.getProduct();
            product.setStock(product.getStock() + orderItem.getQuantity());
            productRepo.save(product);
        }

        paymentRepo.saveAndFlush(payment);
        orderRepo.saveAndFlush(order);
    }

    @Transactional
    public PaymentResponseDTO getPaymentByOrderId(Long orderId, User user) {

        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException("Order not found"));

        if (!order.getUser().getId().equals(user.getId()))
            throw new UnauthorizedUserException("You are not authorized to access this payment");

        Payment payment = paymentRepo.findByOrder(order)
            .orElseThrow(() -> new PaymentNotFoundException("Payment not found for this order"));

        return mapToPaymentResponseDTO(payment);
    }

    private PaymentResponseDTO mapToPaymentResponseDTO(Payment payment) {
        PaymentResponseDTO dto = new PaymentResponseDTO();
        dto.setOrderId(payment.getOrder().getId());
        dto.setAmount(payment.getAmount());
        dto.setStatus(payment.getStatus());
        dto.setPaymentReference(payment.getPaymentReference());
        dto.setCreatedAt(payment.getCreatedAt());
        dto.setUpdatedAt(payment.getUpdatedAt());
        return dto;
    }
}
