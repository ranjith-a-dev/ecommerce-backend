package com.ranjith.ecommerce.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ranjith.ecommerce.entity.ShippingAddress;

@Repository
public interface ShippingAddressRepo extends JpaRepository<ShippingAddress, Long> {
    List<ShippingAddress> findByOrderId(Long orderId);
}
