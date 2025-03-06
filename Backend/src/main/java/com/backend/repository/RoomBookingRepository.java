package com.backend.repository;

import com.backend.entity.RoomBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RoomBookingRepository extends JpaRepository<RoomBooking, Long> {
    List<RoomBooking> findByRoomId(Long roomId);
    boolean existsByRoomIdAndStartTimeBetween(Long roomId, LocalDateTime start, LocalDateTime end);
}
