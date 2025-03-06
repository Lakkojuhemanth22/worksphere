package com.backend.service;

import com.backend.entity.Company;
import com.backend.entity.Role;
import com.backend.entity.User;
import com.backend.repository.CompanyRepository;
import com.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Registers an Admin and creates a new Company.
     */
    public String registerAdmin(String email, String password, String name, String companyName) {
        // Check if email is already taken
        if (userRepository.existsByEmail(email)) {
            return "Email already in use!";
        }

        // Check if company already exists
        if (companyRepository.existsByName(companyName)) {
            return "Company already exists!";
        }

        // Create admin user first (without setting the company)
        User admin = new User();
        admin.setEmail(email);
        admin.setName(name);
        admin.setPassword(passwordEncoder.encode(password));
        admin.setRole(Role.ADMIN);

        userRepository.save(admin);  // Save admin first to get its ID

        // Create and save company
        Company company = new Company();
        company.setName(companyName);
        company.setAdmin(admin);  // Now set the admin
        companyRepository.save(company);

        // Update admin with the saved company
        admin.setCompany(company);
        userRepository.save(admin); // Save again to link the company

        return "Admin registered successfully!";
    }


    /**
     * Registers a User under an existing Admin's company.
     */
    public String registerUser(String email, String password, String name, Role role, Company company) {
        // Check if email is already taken
        if (userRepository.existsByEmail(email)) {
            return "Email already in use!";
        }

        // Ensure the company is valid
        if (company == null) {
            return "Company not found!";
        }

        // Create and save user under the admin's company
        User user = new User();
        user.setEmail(email);
        user.setName(name);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role);
        user.setCompany(company); // Assign user to admin's company

        userRepository.save(user);
        return "User registered successfully under company: " + company.getName();
    }


    /**
     * Handles user login.
     */
    public Optional<User> loginUser(String email, String password) {
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isPresent() && passwordEncoder.matches(password, user.get().getPassword())) {
            return user;
        }
        return Optional.empty();
    }
}
