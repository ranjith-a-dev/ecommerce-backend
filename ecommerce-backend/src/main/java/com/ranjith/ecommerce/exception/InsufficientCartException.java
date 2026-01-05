package com.ranjith.ecommerce.exception;

public class InsufficientCartException extends RuntimeException{

    public InsufficientCartException(String message){
        super(message);
    }
}
