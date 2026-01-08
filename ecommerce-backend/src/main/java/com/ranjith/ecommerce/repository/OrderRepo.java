package com.ranjith.ecommerce.repository;

import java.math.BigDecimal;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ranjith.ecommerce.entity.Order;
import com.ranjith.ecommerce.enums.OrderStatus;

public interface OrderRepo extends JpaRepository<Order,Long> {

    @Query("""
        SELECT o from Order o
        WHERE (o.user.id = :userId)
            AND (:status IS NULL OR o.status = :status)
            AND (:minTotalAmount IS NULL OR o.totalAmount >= :minTotalAmount)
            AND (:maxTotalAmount IS NULL OR o.totalAmount <= :maxTotalAmount)
    """)
    Page<Order> findOrdersByUser(
        @Param("userId") Long userId,
        @Param("status") OrderStatus status,
        @Param("minTotalAmount") BigDecimal minTotalAmount,
        @Param("maxTotalAmount") BigDecimal maxTotalAmount,
        Pageable pageable
    );

    @Query("""
        SELECT o from Order o
        WHERE (:userId IS NULL OR o.user.id = :userId)
            AND (:status IS NULL OR o.status = :status)
            AND (:minTotalAmount IS NULL OR o.totalAmount >= :minTotalAmount)
            AND (:maxTotalAmount IS NULL OR o.totalAmount <= :maxTotalAmount)
            AND (:refundRequested IS NULL OR o.refundRequested = :refundRequested)
    """)
    Page<Order> findAllOrders(
        @Param("userId") Long userId,
        @Param("status") OrderStatus status,
        @Param("minTotalAmount") BigDecimal minTotalAmount,
        @Param("maxTotalAmount") BigDecimal maxTotalAmount,
        @Param("refundRequested") Boolean refundRequested,
        Pageable pageable
    );
}
