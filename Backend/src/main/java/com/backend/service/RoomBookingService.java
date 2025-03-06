package com.backend.service;

import com.backend.entity.Room;
import com.backend.entity.RoomBooking;
import com.backend.entity.User;
import com.backend.exceptions.ResourceNotFoundException;
import com.backend.repository.RoomBookingRepository;
import com.backend.repository.RoomRepository;
import com.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RoomBookingService {

    @Autowired
    private RoomBookingRepository roomBookingRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private UserRepository userRepository;

    public RoomBooking createBooking(Long roomId, Long userId, LocalDateTime startTime, LocalDateTime endTime, List<Long> participants) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Check if the room is already booked for this time
        if (roomBookingRepository.existsByRoomIdAndStartTimeBetween(roomId, startTime, endTime)) {
            throw new RuntimeException("Room is already booked for this time slot");
        }

        RoomBooking booking = RoomBooking.builder()
                .room(room)
                .bookedBy(user)
                .startTime(startTime)
                .endTime(endTime)
                .participants(participants)
                .build();

        return roomBookingRepository.save(booking);
    }

    public List<RoomBooking> getBookingsByRoom(Long roomId) {
        return roomBookingRepository.findByRoomId(roomId);
    }

    public void cancelBooking(Long bookingId, Long userId) {
        RoomBooking booking = roomBookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        // Only the admin or the user who booked can cancel
        if (!booking.getBookedBy().getId().equals(userId)) {
            throw new RuntimeException("You do not have permission to cancel this booking");
        }

        roomBookingRepository.delete(booking);
    }
}