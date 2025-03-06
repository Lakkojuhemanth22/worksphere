package com.backend.service;

import com.backend.dto.DashboardStatsDTO;
import com.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class DashboardService {

    private final UserRepository userRepository;

    public DashboardService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public DashboardStatsDTO getDashboardStats() {
        long totalUsers = userRepository.count();
        int activeSessions = ThreadLocalRandom.current().nextInt(20, 50); // Simulating real-time data
        int pendingRequests = ThreadLocalRandom.current().nextInt(1, 10);

        return new DashboardStatsDTO(totalUsers, activeSessions, pendingRequests);
    }
}
