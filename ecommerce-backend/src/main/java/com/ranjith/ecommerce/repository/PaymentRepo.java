package com.ranjith.ecommerce.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ranjith.ecommerce.entity.Payment;
import java.util.Optional;


@Repository
public interface PaymentRepo extends JpaRepository<Payment,Long>{

    Optional<Payment> findByPaymentReference(String paymentReference);
}
