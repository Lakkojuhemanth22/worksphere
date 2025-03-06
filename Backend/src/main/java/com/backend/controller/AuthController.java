package com.backend.controller;

import com.backend.entity.Role;
import com.backend.entity.User;
import com.backend.repository.CompanyRepository;
import com.backend.repository.UserRepository;
import com.backend.service.AuthService;
import com.backend.utils.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;

    /**
     * Admin registers a new company and becomes the admin of that company.
     * An existing admin can register users under their company.
     */
    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody Map<String, String> request, Principal principal) {
        // Extract fields from request
        String email = request.get("email");
        String password = request.get("password");
        String name = request.get("name");
        String roleString = request.get("role");
        String companyName = request.get("companyName");

        // Validate input fields
        if (email == null || email.isEmpty() ||
                password == null || password.isEmpty() ||
                name == null || name.isEmpty() ||
                roleString == null || roleString.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "All fields (email, password, name, role) are required!"));
        }

        // Convert role string to Enum
        Role role;
        try {
            role = Role.valueOf(roleString.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid role provided!"));
        }

        // If registering an Admin, a company name is required
        if (role == Role.ADMIN) {
            if (companyName == null || companyName.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Company name is required for admin registration!"));
            }

            // Check if the company already exists
            if (companyRepository.existsByName(companyName)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Company already exists!"));
            }

            // Register admin and create the company
            String message = authService.registerAdmin(email, password, name, companyName);
            return ResponseEntity.ok(Map.of("message", message));
        } else {
            // Ensure a logged-in admin is registering this user
            if (principal == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized!"));
            }

            // Find the logged-in admin
            User admin = userRepository.findByEmail(principal.getName()).orElse(null);
            if (admin == null || admin.getRole() != Role.ADMIN) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Only admins can register users!"));
            }

            // Register the user under the admin's company
            String message = authService.registerUser(email, password, name, role, admin.getCompany());
            return ResponseEntity.ok(Map.of("message", message));
        }
    }

    /**
     * Handles user login and returns a JWT token.
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        // Validate input fields
        if (email == null || email.isEmpty() || password == null || password.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email and password are required!"));
        }

        Optional<User> user = authService.loginUser(email, password);
        if (user.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid credentials!"));
        }

        User authenticatedUser = user.get();
        String token = jwtUtil.generateToken(authenticatedUser.getEmail(), authenticatedUser.getRole());

        return ResponseEntity.ok(Map.of(
                "token", token,
                "message", "Login successful!",
                "email", authenticatedUser.getEmail(),
                "role", authenticatedUser.getRole().toString()
        ));
    }
}
