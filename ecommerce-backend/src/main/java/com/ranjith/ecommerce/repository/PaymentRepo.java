package com.ranjith.ecommerce.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ranjith.ecommerce.entity.Order;
import com.ranjith.ecommerce.entity.Payment;
import com.ranjith.ecommerce.entity.User;
import com.ranjith.ecommerce.enums.PaymentStatus;

import java.math.BigDecimal;
import java.util.Optional;


@Repository
public interface PaymentRepo extends JpaRepository<Payment,Long>{

    Optional<Payment> findByPaymentReference(String paymentReference);

    Optional<Payment> findByOrder(Order order);

    @Query("""
        SELECT p FROM Payment p
        WHERE ( p.order.user = :user )
            AND (:status IS NULL OR p.status = :status)
            AND (:minAmount IS NULL OR p.amount >= :minAmount)
            AND (:maxAmount IS NULL OR p.amount <= :maxAmount)
    """)
    Page<Payment> findUserPayments(
        @Param("user") User user,
        @Param("status") PaymentStatus status,
        @Param("minAmount") BigDecimal minAmount,
        @Param("maxAmount") BigDecimal maxAmount,
        Pageable pageable
    );

    @Query("""
        SELECT p FROM Payment p
        WHERE (:userId IS NULL OR p.order.user.id = :userId)
            AND (:status IS NULL OR p.status = :status)
            AND (:minAmount IS NULL OR p.amount >= :minAmount)
            AND (:maxAmount IS NULL OR p.amount <= :maxAmount)
    """)
    Page<Payment> findAllPayments(
        @Param("userId") Long userId,
        @Param("status") PaymentStatus status,
        @Param("minAmount") BigDecimal minAmount,
        @Param("maxAmount") BigDecimal maxAmount,
        Pageable pageable
    );
}
