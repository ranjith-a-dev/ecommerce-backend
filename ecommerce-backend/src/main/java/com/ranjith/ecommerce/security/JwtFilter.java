package com.ranjith.ecommerce.security;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
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
public class JwtFilter extends OncePerRequestFilter{

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    protected void doFilterInternal(HttpServletRequest request,HttpServletResponse response,FilterChain filterChain) throws IOException, ServletException{

        String path = request.getServletPath();

        if(path.startsWith("/swagger-ui") || path.startsWith("/v3/api-docs") || path.startsWith("/swagger-ui.html")){
            filterChain.doFilter(request,response);
            return;
        }

        String authHeader = request.getHeader("Authorization");

        String username = null;
        String token = null;

        if(authHeader != null && authHeader.startsWith("Bearer ")){
            token = authHeader.substring(7).trim();
            try{
                username = jwtUtil.extractUsername(token);
            }
            catch(Exception e){
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write(
                    "{\"error\":\"Unauthorized\",\"message\":\"Invalid or expired Jwt\"}"
                );
                return;
            }
        }

        if(username != null && SecurityContextHolder.getContext().getAuthentication() == null){

            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            
            if(jwtUtil.validateToken(token,userDetails)){
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(userDetails,null,userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request){
        return request.getServletPath().startsWith("/api/auth");
    }
}
