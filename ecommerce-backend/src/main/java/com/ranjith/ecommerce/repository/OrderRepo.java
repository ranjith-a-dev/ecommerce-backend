package com.ranjith.ecommerce.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ranjith.ecommerce.entity.Order;

public interface OrderRepo extends JpaRepository<Order,Long> {

    List<Order> findByUserId(Long userId);
}
