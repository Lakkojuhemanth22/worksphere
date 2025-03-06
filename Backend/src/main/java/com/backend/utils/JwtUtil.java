package com.backend.utils;

import com.backend.entity.Role;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Base64;
import java.util.Date;
import java.util.function.Function;

@Component
public class JwtUtil {
    // ✅ Secure 32-byte key (must be exactly 32 bytes)
    private static final String SECRET = Base64.getEncoder().encodeToString("my-secret-key-32-chars".getBytes());
    private static final Key SECRET_KEY = Keys.hmacShaKeyFor(SECRET.getBytes());
    private static final long EXPIRATION_TIME = 3600000; // 1 hour

    // ✅ Generate Token with Email & Role
    public String generateToken(String email, Role role) {
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .claim("role", role.name()) // ✅ Store role as String
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(SECRET_KEY, SignatureAlgorithm.HS256)
                .compact();
    }

    // ✅ Extract Email (Subject)
    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // ✅ Extract Role
    public Role extractRole(String token) {
        Claims claims = extractAllClaims(token);
        return Role.valueOf(claims.get("role", String.class));
    }

    // ✅ Extract Any Claim
    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    // ✅ Extract All Claims
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // ✅ Validate Token with Exception Handling
    public boolean validateToken(String token) {
        try {
            Claims claims = extractAllClaims(token);
            return !claims.getExpiration().before(new Date());
        } catch (ExpiredJwtException e) {
            System.out.println("❌ Token Expired: " + e.getMessage());
        } catch (MalformedJwtException e) {
            System.out.println("❌ Invalid Token: " + e.getMessage());
        } catch (SignatureException e) {
            System.out.println("❌ Invalid Signature: " + e.getMessage());
        } catch (Exception e) {
            System.out.println("❌ JWT Validation Error: " + e.getMessage());
        }
        return false;
    }
}
