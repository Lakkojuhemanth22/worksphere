package com.backend.service;

import com.backend.entity.Room;
import com.backend.entity.User;
import com.backend.repository.RoomRepository;
import com.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;
    private final UserRepository userRepository;

    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    public Optional<Room> getRoomById(Long id) {
        return roomRepository.findById(id);
    }

    public Room createRoom(Room room) {
        return roomRepository.save(room);
    }

    public Room updateRoom(Long id, Room updatedRoom) {
        return roomRepository.findById(id).map(room -> {
            room.setName(updatedRoom.getName());
            room.setCapacity(updatedRoom.getCapacity());
            room.setStatus(updatedRoom.getStatus());
            room.setUpdatedAt(LocalDateTime.now());
            return roomRepository.save(room);
        }).orElseThrow(() -> new RuntimeException("Room not found!"));
    }

    public void deleteRoom(Long id) {
        roomRepository.deleteById(id);
    }

    // Assign Employee to Room
    public Room assignEmployeeToRoom(Long roomId, Long employeeId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));
        User employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        room.getEmployees().add(employee);
        return roomRepository.save(room);
    }

    // Remove Employee from Room
    public Room removeEmployeeFromRoom(Long roomId, Long employeeId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));
        User employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        room.getEmployees().remove(employee);
        return roomRepository.save(room);
    }

    // Get Employees in a Room
    public Set<User> getEmployeesInRoom(Long roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));
        return room.getEmployees();
    }
}
