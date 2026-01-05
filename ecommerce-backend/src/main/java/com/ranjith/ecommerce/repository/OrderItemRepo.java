package com.ranjith.ecommerce.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ranjith.ecommerce.entity.OrderItem;

public interface OrderItemRepo extends JpaRepository<OrderItem,Long> {

}
