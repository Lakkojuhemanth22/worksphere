package com.backend.controller;

import com.backend.entity.Room;
import com.backend.entity.User;
import com.backend.repository.RoomRepository;
import com.backend.repository.UserRepository;
import com.backend.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping("/admin/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;

    @GetMapping
    public ResponseEntity<List<Room>> getRooms(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        User admin = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (!admin.getRole().name().equals("ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }

        List<Room> rooms = roomRepository.findByCompany(admin.getCompany());
        return ResponseEntity.ok(rooms);
    }

    @PostMapping
    public ResponseEntity<?> createRoom(@RequestBody Room room, @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }

        User admin = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (!admin.getRole().name().equals("ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
        }

        room.setCompany(admin.getCompany());
        Room savedRoom = roomRepository.save(room);
        return ResponseEntity.ok(savedRoom);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Room> getRoomById(@PathVariable Long id) {
        Optional<Room> room = roomService.getRoomById(id);
        return room.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Room> updateRoom(@PathVariable Long id, @RequestBody Room updatedRoom) {
        return ResponseEntity.ok(roomService.updateRoom(id, updatedRoom));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long id) {
        roomService.deleteRoom(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{roomId}/assign/{employeeId}")
    public ResponseEntity<Room> assignEmployeeToRoom(@PathVariable Long roomId, @PathVariable Long employeeId) {
        return ResponseEntity.ok(roomService.assignEmployeeToRoom(roomId, employeeId));
    }

    @DeleteMapping("/{roomId}/remove/{employeeId}")
    public ResponseEntity<Room> removeEmployeeFromRoom(@PathVariable Long roomId, @PathVariable Long employeeId) {
        return ResponseEntity.ok(roomService.removeEmployeeFromRoom(roomId, employeeId));
    }

    @GetMapping("/{roomId}/employees")
    public ResponseEntity<Set<User>> getEmployeesInRoom(@PathVariable Long roomId) {
        return ResponseEntity.ok(roomService.getEmployeesInRoom(roomId));
    }
}
