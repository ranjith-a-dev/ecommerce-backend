package com.ranjith.ecommerce.validation;

import org.springframework.stereotype.Component;

import com.ranjith.ecommerce.enums.OrderStatus;

@Component
public class OrderStatusValidator {

    public void validateStatusTransition(OrderStatus current,OrderStatus next){

        switch(current) {

            case CREATED:
                if(next != OrderStatus.PAYMENT_PENDING && next != OrderStatus.CANCELLED)
                    throw new IllegalStateException("Invalid order status transition");
                break;
            
            case PAYMENT_PENDING:
                if(next != OrderStatus.PAID && next != OrderStatus.CANCELLED)
                    throw new IllegalStateException("Invalid order status transition");
                break;

            case PAID:
                if(next != OrderStatus.SHIPPED && next != OrderStatus.CANCELLED)
                    throw new IllegalStateException("Invalid order status transition");
                break;
            
            case SHIPPED:
                if(next != OrderStatus.DELIVERED)
                    throw new IllegalStateException("Invalid order status transition");
                break;
            
            case CANCELLED:
                if(next != OrderStatus.REFUND_INITIATED)
                    throw new IllegalStateException("Invalid order status transition");
                break;
            
            case REFUND_INITIATED:
                if(next != OrderStatus.REFUNDED)
                    throw new IllegalStateException("Invalid order status transition");
                break;
            
            default:
                throw new IllegalStateException("Order is already closed");
        }
    }
}
