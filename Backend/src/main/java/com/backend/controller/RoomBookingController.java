package com.backend.controller;

import com.backend.entity.RoomBooking;
import com.backend.service.RoomBookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/admin/rooms")
public class RoomBookingController {

    @Autowired
    private RoomBookingService roomBookingService;

    @PostMapping("/{roomId}/book")
    public RoomBooking bookRoom(
            @PathVariable Long roomId,
            @RequestParam Long userId,
            @RequestParam LocalDateTime startTime,
            @RequestParam LocalDateTime endTime,
            @RequestBody List<Long> participants
    ) {
        return roomBookingService.createBooking(roomId, userId, startTime, endTime, participants);
    }

    @GetMapping("/{roomId}/bookings")
    public List<RoomBooking> getRoomBookings(@PathVariable Long roomId) {
        return roomBookingService.getBookingsByRoom(roomId);
    }

    @DeleteMapping("/bookings/{bookingId}")
    public String cancelBooking(@PathVariable Long bookingId, @RequestParam Long userId) {
        roomBookingService.cancelBooking(bookingId, userId);
        return "Booking canceled successfully";
    }
}