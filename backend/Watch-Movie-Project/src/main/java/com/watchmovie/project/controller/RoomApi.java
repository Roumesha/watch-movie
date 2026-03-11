package com.watchmovie.project.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.watchmovie.project.dto.CreateRoomRequest;
import com.watchmovie.project.dto.JoinRoomRequest;
import com.watchmovie.project.dto.ParticipantDTO;
import com.watchmovie.project.dto.RoomResponseDTO;
import com.watchmovie.project.dto.RoomSyncRequest;
import com.watchmovie.project.entity.RoomEntity;
import com.watchmovie.project.entity.RoomParticipantEntity;
import com.watchmovie.project.entity.UserEntity;
import com.watchmovie.project.repository.RoomRepository;
import com.watchmovie.project.repository.UserRepository;
import com.watchmovie.project.service.RoomService;
import com.watchmovie.project.state.Room;

@RestController
@RequestMapping("/rooms")
public class RoomApi {
	@Autowired
	public RoomService roomService;
	
	@Autowired
	public RoomRepository roomRepository;
	
	@Autowired
	public UserRepository userRepository;
	
	@PostMapping("/create")
	public ResponseEntity<RoomEntity> createRoom(@RequestBody CreateRoomRequest request,
			Authentication authentication) {
		String email=authentication.getName();
		 request.setHostEmail(email);
		return ResponseEntity.ok(
	            roomService.createRoom(request));
	}
	
	@PostMapping("/join")
	public ResponseEntity<?> joinRoom(@RequestBody JoinRoomRequest request) {
		RoomResponseDTO response=roomService.joinRoom(request);
		return ResponseEntity.ok(response);
	}
	
	@GetMapping("/{roomId}/participants")
	public List<ParticipantDTO> getParticipants(@PathVariable Long roomId) {

	    return roomService.getParticipants(roomId)
	            .stream()
	            .map(p -> new ParticipantDTO(
	                    p.getDisplayName(),
	                    p.getRole()
	            ))
	            .toList();
	}
	
	@DeleteMapping("/leave")
	public ResponseEntity<String> leaveRoom(@RequestParam Long roomId,@RequestParam String sessionId){
		roomService.leaveRoom(roomId, sessionId);
		return ResponseEntity.ok("User left the room"); 
	}
	
	@PostMapping("/sync/{roomId}")
	public ResponseEntity<String> syncRoom(@PathVariable Long roomId,@RequestBody RoomSyncRequest request){
		roomService.syncRoom(roomId, request.isPlaying(), request.getCurrentTime());
		return ResponseEntity.ok("Room Synced");
	}
	
	@GetMapping("/getRoom/{roomId}")
	public RoomEntity getRoom(@PathVariable Long roomId) {
	    return roomRepository.findById(roomId)
	            .orElseThrow(() -> new RuntimeException("Room not found"));
	}
	
	@GetMapping("{roomId}/host/{userId}")
	public boolean isHost(@PathVariable Long roomId,@PathVariable Long userId) {
		RoomEntity room=roomRepository.findById(roomId)
				.orElseThrow(()->new RuntimeException("Room not found"));
		return room.getHost().getId().equals(userId);
	}

}
