package com.ranjith.ecommerce.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "shipping_addresses")
public class ShippingAddress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Order is required")
    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 60, message = "Full name must be 2 to 60 characters")
    @Column(nullable = false)
    private String fullName;

    @NotBlank(message = "Phone number is required")
    @Pattern(
            regexp = "^[+]?[0-9]{8,15}$",
            message = "Phone number must be 8 to 15 digits (optional +)"
    )
    @Column(nullable = false)
    private String phoneNumber;

    @NotBlank(message = "Street address is required")
    @Size(min = 5, max = 120, message = "Street address must be 5 to 120 characters")
    @Column(nullable = false)
    private String streetAddress;

    @NotBlank(message = "City is required")
    @Size(min = 2, max = 50, message = "City must be 2 to 50 characters")
    @Column(nullable = false)
    private String city;

    @NotBlank(message = "State is required")
    @Size(min = 2, max = 50, message = "State must be 2 to 50 characters")
    @Column(nullable = false)
    private String state;

    @NotBlank(message = "Postal code is required")
    @Size(min = 4, max = 10, message = "Postal code must be 4 to 10 characters")
    @Column(nullable = false)
    private String postalCode;

    @NotBlank(message = "Country is required")
    @Size(min = 2, max = 56, message = "Country must be 2 to 56 characters")
    @Column(nullable = false)
    private String country;

    @Size(max = 500, message = "Delivery instructions can be maximum 500 characters")
    @Column(length = 500)
    private String deliveryInstructions;
}
