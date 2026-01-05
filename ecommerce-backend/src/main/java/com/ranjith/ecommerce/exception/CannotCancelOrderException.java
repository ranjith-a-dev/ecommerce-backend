package com.ranjith.ecommerce.exception;

public class CannotCancelOrderException extends RuntimeException{

    public CannotCancelOrderException(String message){
        super(message);
    }
}
