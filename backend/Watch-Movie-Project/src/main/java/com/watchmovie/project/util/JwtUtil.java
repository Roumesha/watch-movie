package com.watchmovie.project.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.*;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtUtil {

    private static final String SECRET_KEY = "watchMovieSecretKeyWatchMovieSecretKey12345";

    public String generateToken(Long userId, String email,String username) {
        return Jwts.builder()
                .setSubject(email)
                .claim("userId", userId)
                .claim("username", username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 86400000)) // 1 day
                .signWith(SignatureAlgorithm.HS256, SECRET_KEY)
                .compact();
    }
    
    public String extractEmail(String token) {
    	return Jwts.parser()
    			.setSigningKey(SECRET_KEY)
    			.parseClaimsJws(token)
    			.getBody().getSubject();
    }
    
    public boolean validateToken(String token) {
    	try {
    		extractEmail(token);
    		return true;
    	}
    	catch(Exception e) {
    		return false;
    	}
    }
}
