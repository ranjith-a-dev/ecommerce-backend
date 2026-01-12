package com.ranjith.ecommerce.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import com.ranjith.ecommerce.dto.ApiErrorDTO;

import jakarta.validation.ConstraintViolationException;

@RestControllerAdvice
public class GlobalExceptionHandler {


    // @Valid DTO Validation

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorDTO> handleBodyValidation(MethodArgumentNotValidException ex){
        
        String message = ex.getBindingResult()

            .getFieldErrors()
            .stream()
            .findFirst()
            .map(error -> error.getDefaultMessage())
            .orElse("Validation failed");

        return ResponseEntity
            .badRequest()
            .body(new ApiErrorDTO(400, message));
    }

    // @PathVariable @RequestParam Validation

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiErrorDTO> handleValidation(ConstraintViolationException ex){

        String message = ex.getConstraintViolations()
            .iterator()
            .next()
            .getMessage();

        return ResponseEntity
            .badRequest()
            .body(new ApiErrorDTO(400, message));
    }

    // Enum mismatch

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiErrorDTO> handleEnumError(MethodArgumentTypeMismatchException ex){
        
        return ResponseEntity.badRequest()
            .body(new ApiErrorDTO(400, "Inavlid value for parameter: " + ex.getName()));
    }

    // NOT FOUND

    @ExceptionHandler({
        ProductNotFoundException.class,
        CartItemNotFoundException.class,
        OrderNotFoundException.class,
        PaymentNotFoundException.class,
        UserNotFoundException.class,
        CategoryNotFoundException.class
    })
    public ResponseEntity<ApiErrorDTO> handleNotFound(RuntimeException ex){
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(new ApiErrorDTO(404, ex.getMessage()));
    }

    // CONFLICT

    @ExceptionHandler({
        InsufficientCartException.class,
        InsufficientStockException.class,
        PaymentAlreadyDoneException.class
    })
    public ResponseEntity<ApiErrorDTO> handleConflict(RuntimeException ex){
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(new ApiErrorDTO(409, ex.getMessage()));
    }

    // BAD REQUEST

    @ExceptionHandler({
        UserAlreadyExistsException.class,
        PasswordMismatchException.class,
        CannotCancelOrderException.class
    })
    public ResponseEntity<ApiErrorDTO> handleBadRequest(RuntimeException ex){
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(new ApiErrorDTO(400, ex.getMessage()));
    }

    @ExceptionHandler(UnauthorizedUserException.class)
    public ResponseEntity<ApiErrorDTO> handleUnauthorizedUser(UnauthorizedUserException ex){
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(new ApiErrorDTO(403, ex.getMessage()));
    }
}