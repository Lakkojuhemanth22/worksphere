package com.backend.controller;

import com.backend.entity.Role;
import com.backend.entity.User;
import com.backend.repository.UserRepository;
import com.backend.service.AuthService;
import com.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173") // Allow frontend communication
public class AdminController {
    private final UserService userService;
    private final AuthService authService;
    private final UserRepository userRepository;

    // Get all users (Only for the admin's company)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers(Principal principal) {
        // Get the logged-in admin
        User admin = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Admin not found!"));

        // Ensure admin has a company
        if (admin.getCompany() == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Collections.emptyList());
        }

        // Fetch users ONLY from the admin's company
        List<User> users = userRepository.findByCompany(admin.getCompany());

        return ResponseEntity.ok(users);
    }


    // Get a single user by ID
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/users/{id}")
    public Optional<User> getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    // Update user details
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/users/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody User updatedUser) {
        return userService.updateUser(id, updatedUser);
    }

    // Delete user
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/users/{id}")
    public Map<String, String> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return Map.of("message", "User deleted successfully!");
    }

    // Update user role
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/users/{id}/role")
    public User updateUserRole(@PathVariable Long id, @RequestBody Map<String, String> request) {
        Role role = Role.valueOf(request.get("role").toUpperCase());
        return userService.updateUserRole(id, role);
    }

    // Register a new employee under the admin's company
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/users/register")
    public ResponseEntity<Map<String, String>> registerEmployee(@RequestBody Map<String, String> request, Principal principal) {
        String email = request.get("email");
        String password = request.get("password");
        String name = request.get("name");

        if (email == null || password == null || name == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "All fields (email, password, name) are required!"));
        }

        // Get the logged-in admin
        User admin = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Admin not found!"));

        // Register the user under the admin's company
        String message = authService.registerUser(email, password, name, Role.EMPLOYEE, admin.getCompany());
        return ResponseEntity.ok(Map.of("message", message));
    }
}
