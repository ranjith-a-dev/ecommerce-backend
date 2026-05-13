package com.ranjith.ecommerce;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class EcommerceBackendApplication {

    private static final Logger log = LoggerFactory.getLogger(EcommerceBackendApplication.class);

    public static void main(String[] args) {
        long start = System.currentTimeMillis();
        log.info("🚀 JVM started, beginning Spring init");
        
        SpringApplication app = new SpringApplication(EcommerceBackendApplication.class);
        app.run(args);
        
        log.info("✅ Application ready in {}ms", System.currentTimeMillis() - start);
    }
}