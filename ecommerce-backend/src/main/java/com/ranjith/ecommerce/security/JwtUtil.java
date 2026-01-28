package com.ranjith.ecommerce.security;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.List;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {

    private final String secretKey = "mysecretkey12345mysecretkey12345";

    public Key getSigningKey(){
        return Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(String username){
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60))
                .signWith(getSigningKey(),SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateToken(String username, List<String> authorities){
        return Jwts.builder()
                .setSubject(username)
                .claim("authorities", authorities)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60))
                .signWith(getSigningKey(),SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractUsername(String token){
        return getClaims(token).getSubject();
    }

    @SuppressWarnings("unchecked")
    public List<String> extractAuthorities(String token){
        try {
            List<String> authorities = getClaims(token).get("authorities", List.class);
            System.out.println("DEBUG JwtUtil extractAuthorities: Extracted authorities = " + authorities);
            return authorities != null ? authorities : List.of();
        } catch(Exception e) {
            System.out.println("DEBUG JwtUtil extractAuthorities: Error extracting - " + e.getMessage());
            return List.of();
        }
    }

    public boolean validateToken(String token, UserDetails userDetails){
        try{
            getClaims(token);
            return true;
        }
        catch(Exception e){
            return false;
        }
    }
    private Claims getClaims(String token){
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}

