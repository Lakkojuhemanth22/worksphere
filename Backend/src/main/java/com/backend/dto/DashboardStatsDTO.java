package com.backend.dto;

import lombok.Getter;

@Getter
public class DashboardStatsDTO {
    private final long users;
    private final int sessions;
    private final int requests;

    public DashboardStatsDTO(long users, int sessions, int requests) {
        this.users = users;
        this.sessions = sessions;
        this.requests = requests;
    }

}

