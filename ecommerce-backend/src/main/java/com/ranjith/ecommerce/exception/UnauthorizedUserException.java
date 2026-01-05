package com.ranjith.ecommerce.exception;

public class UnauthorizedUserException extends RuntimeException {

    public UnauthorizedUserException(String message){
        super(message);
    }
}
