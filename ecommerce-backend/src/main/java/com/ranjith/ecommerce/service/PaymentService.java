package com.ranjith.ecommerce.service;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
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
    OrderRepo orderRepo;

    @Autowired
    PaymentRepo paymentRepo;

    @Autowired
    OrderStatusValidator orderStatusValidator;

    @Autowired
    ProductRepo productRepo;

    @Transactional
    public PaymentResponseDTO initiatePayment(Long orderId,User user){
        
        Order order = orderRepo.findById(orderId)
            .orElseThrow(() -> new OrderNotFoundException("Order not found"));
        
        if(!order.getUser().getId().equals(user.getId()))
            throw new UnauthorizedUserException("You are not authorized to pay this order");
        
        if(order.getStatus() != OrderStatus.CREATED)
            throw new IllegalStateException("Payment already initiated or order closed");

        orderStatusValidator.validateStatusTransition(order.getStatus(),OrderStatus.PAYMENT_PENDING);

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setAmount(order.getTotalAmount());
        payment.setStatus(PaymentStatus.INITIATED);
        payment.setPaymentReference(UUID.randomUUID().toString());

        order.setStatus(OrderStatus.PAYMENT_PENDING);

        paymentRepo.save(payment);
        orderRepo.save(order);

        return new PaymentResponseDTO(
            payment.getPaymentReference(),
            payment.getStatus(),
            payment.getAmount()
        );
    }

    @Transactional
    public void markPaymentSuccess(String paymentRef){

        Payment payment = paymentRepo.findByPaymentReference(paymentRef)
            .orElseThrow(() -> new PaymentNotFoundException("Payment not found"));
        
        if(payment.getStatus() != PaymentStatus.INITIATED)
            throw new IllegalStateException("Payment already processed");

        payment.setStatus(PaymentStatus.SUCCESS);

        Order order = payment.getOrder();

        orderStatusValidator.validateStatusTransition(order.getStatus(),OrderStatus.PAID);

        for(OrderItem orderItem : order.getOrderItems()){
            Product product = orderItem.getProduct();
            product.setStock(product.getStock() - orderItem.getQuantity());
            productRepo.save(product);
        }

        order.setStatus(OrderStatus.PAID);
    }

    @Transactional
    public void markPaymentFailure(String paymentRef){

        Payment payment = paymentRepo.findByPaymentReference(paymentRef)
            .orElseThrow(() -> new PaymentNotFoundException("Payment not found"));

        if(payment.getStatus() != PaymentStatus.INITIATED){
            throw new PaymentAlreadyDoneException("Payment already processed");
        }
        
        payment.setStatus(PaymentStatus.FAILED);

        Order order = payment.getOrder();
        orderStatusValidator.validateStatusTransition(order.getStatus(), OrderStatus.CANCELLED);   
        order.setStatus(OrderStatus.CANCELLED); 
    }

    @Transactional
    public void initiateRefund(Long orderId) {
        
        Order order = orderRepo.findById(orderId)
            .orElseThrow(() -> new OrderNotFoundException("Order not found"));
        
        if(order.getStatus() != OrderStatus.PAID)
            throw new IllegalStateException("Refund allowed only for PAID orders");

        if(!order.isRefundRequested())
            throw new IllegalStateException("Refund not requested by user");

        orderStatusValidator.validateStatusTransition(order.getStatus(), OrderStatus.REFUND_INITIATED);

        Payment payment = paymentRepo.findByOrder(order)
            .orElseThrow(() -> new PaymentNotFoundException("Payment not found"));

        payment.setStatus(PaymentStatus.REFUND_INITIATED);
        order.setStatus(OrderStatus.REFUND_INITIATED);
    }

    @Transactional
    public void completeRefund(Long orderId){

        Order order = orderRepo.findById(orderId)
            .orElseThrow(() -> new OrderNotFoundException("Order not found"));
        
        if(order.getStatus() != OrderStatus.REFUND_INITIATED)
            throw new IllegalStateException("Refund not initiated");

        orderStatusValidator.validateStatusTransition(order.getStatus(), OrderStatus.REFUNDED);

        Payment payment = paymentRepo.findByOrder(order)
            .orElseThrow(() -> new PaymentNotFoundException("Payment not found"));

        payment.setStatus(PaymentStatus.REFUNDED);
        order.setStatus(OrderStatus.REFUNDED);

        for(OrderItem orderItem : order.getOrderItems()){
            Product product = orderItem.getProduct();
            product.setStock(product.getStock() + orderItem.getQuantity());
            productRepo.save(product);
        }
    }
}
