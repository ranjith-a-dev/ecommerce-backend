package com.ranjith.ecommerce.security;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        String method = request.getMethod();

        if (path.startsWith("/api/products")) return true;
        if (path.startsWith("/api/categories")) return true;
        if (path.startsWith("/api/auth")) return true;
        if (path.startsWith("/api/cart")) return true;

        // Root healthcheck
        if (path.equals("/")) return true;

        // Actuator
        if (path.startsWith("/actuator")) return true;

        // Swagger
        if (path.startsWith("/swagger-ui") ||
            path.startsWith("/v3/api-docs") ||
            path.equals("/swagger-ui.html")) return true;

        // Auth endpoints
        if (path.startsWith("/api/auth")) return true;

        // Public GET endpoints
        if (HttpMethod.GET.matches(method) && path.startsWith("/api/products")) return true;
        if (HttpMethod.GET.matches(method) && path.startsWith("/api/categories")) return true;

        return false;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws IOException, ServletException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7).trim();
        String username;

        try {
            username = jwtUtil.extractUsername(token);
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"Invalid or expired Jwt\"}");
            return;
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            if (jwtUtil.validateToken(token, userDetails)) {

                List<String> tokenAuthorities = jwtUtil.extractAuthorities(token);
                List<SimpleGrantedAuthority> authorities = new ArrayList<>();

                if (tokenAuthorities != null && !tokenAuthorities.isEmpty()) {
                    for (String auth : tokenAuthorities) {
                        authorities.add(new SimpleGrantedAuthority(auth));
                    }
                } else {
                    userDetails.getAuthorities()
                            .forEach(a -> authorities.add(new SimpleGrantedAuthority(a.getAuthority())));
                }

                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(userDetails, null, authorities);

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }
}