package com.ranjith.ecommerce.exception;

public class PaymentAlreadyDoneException extends RuntimeException {

    public PaymentAlreadyDoneException(String message){
        super(message);
    }
}
