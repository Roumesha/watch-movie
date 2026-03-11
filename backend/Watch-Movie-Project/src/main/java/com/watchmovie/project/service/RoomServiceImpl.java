package com.watchmovie.project.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.watchmovie.project.dto.CreateRoomRequest;
import com.watchmovie.project.dto.JoinRoomRequest;
import com.watchmovie.project.dto.RoomResponseDTO;
import com.watchmovie.project.entity.MovieEntity;
import com.watchmovie.project.entity.RoomEntity;
import com.watchmovie.project.entity.RoomParticipantEntity;
import com.watchmovie.project.entity.UserEntity;
import com.watchmovie.project.repository.MovieRepository;
import com.watchmovie.project.repository.RoomParticipantRepository;
import com.watchmovie.project.repository.RoomRepository;
import com.watchmovie.project.repository.UserRepository;
import com.watchmovie.project.state.RoomStore;

import org.springframework.transaction.annotation.Transactional;


@Service
public class RoomServiceImpl implements RoomService{

	@Autowired
	private RoomRepository roomRepository;
	
	@Autowired
	private RoomParticipantRepository roomParticipantRepository;
	
	@Autowired
	private MovieRepository movieRepository;
	
	@Autowired
	private UserRepository userRepository;
	
	@Autowired
	private RoomStore roomStore;

	
	@Override
	public RoomEntity createRoom(CreateRoomRequest request) {
		String roomCode=UUID.randomUUID()
				.toString()
				.substring(0,6)
				.toUpperCase();
		
		RoomEntity room=new RoomEntity();
		
		MovieEntity movie=movieRepository.findById(request.getMovieId()).orElseThrow(()->new RuntimeException("Movie not found"));
		
		UserEntity user=userRepository.findByEmail(request.getHostEmail()).orElseThrow(()->new RuntimeException("User not found"));
		
		boolean exist=roomRepository.existsByRoomName(request.getRoomName());
		if(exist) {
			throw new ResponseStatusException(HttpStatus.CONFLICT,"Room name already exists ");
		}
		
		room.setRoomName(request.getRoomName());
		room.setRoomCode(roomCode);
		room.setMovie(movie);
		room.setHost(user);
		
		RoomEntity savedRoom=roomRepository.save(room);
		
		com.watchmovie.project.state.Room socketRoom =
		        new com.watchmovie.project.state.Room(savedRoom.getId().toString());

		roomStore.addRoom(savedRoom.getRoomCode(), socketRoom);
	
		
		return savedRoom;
	}

	@Override
	@Transactional
	public RoomResponseDTO joinRoom(JoinRoomRequest request) {
		RoomEntity room=roomRepository.findByRoomCode(request.getRoomCode()).orElseThrow(()->new ResponseStatusException(HttpStatus.BAD_REQUEST,"Invalid Room code"));
		


		
		return new RoomResponseDTO(
				room.getId(),
				room.getRoomName(),
				room.getRoomCode(),
				room.getIsPlaying(),
				room.getCurrentTimePlayer(),
				room.getMovie().getId());
	}

	@Override
	public List<RoomParticipantEntity> getParticipants(Long roomId) {
		RoomEntity room=roomRepository.findById(roomId).orElseThrow(()->new RuntimeException("Room not found")); 
		return roomParticipantRepository.findByRoom(room);
	}
	
	

	@Override
	@Transactional
	public void leaveRoom(Long roomId, String sessionId) {
		RoomEntity room = roomRepository.findById(roomId)
	            .orElseThrow(() -> new RuntimeException("Room not found"));

	    RoomParticipantEntity participant =
	            roomParticipantRepository.findByRoomAndSessionId(room,sessionId)
	            .orElseThrow(() -> new RuntimeException("Participant not found"));
	    boolean isHost="HOST".equals(participant.getRole());
	    roomParticipantRepository.delete(participant);
	    
	    if(isHost) {
	    	roomParticipantRepository.deleteAllByRoom(room);
	    	roomRepository.delete(room);
	    	roomStore.removeRoom(room.getRoomCode());
	    	return;
	    	
	    }
	    
	    boolean emptyRoom=roomParticipantRepository.findByRoom(room).isEmpty();
	    if(emptyRoom) {
	    	roomRepository.delete(room);
	    	roomStore.removeRoom(room.getRoomCode());
	    }
	    System.out.println("LEAVE SESSION: " + sessionId);

	    
	    
		
	}

	@Override
	public void syncRoom(Long roomId, boolean playing, double currentTime) {
		RoomEntity room=roomRepository.findById(roomId)
				.orElseThrow(() -> new RuntimeException("Room not found"));
		
		room.setIsPlaying(playing);
		room.setCurrentTimePlayer(currentTime);
		roomRepository.save(room);
		
	}
	@Override
	public RoomEntity findByRoomCode(String roomCode) {
	    return roomRepository.findByRoomCode(roomCode)
	            .orElse(null);
	}

	@Override
	@Transactional
	public void removeParticipantFromDB(String roomCode, String sessionId) {
		// TODO Auto-generated method stub
		RoomEntity room = roomRepository.findByRoomCode(roomCode).orElse(null);

		if(room==null) {
			return;
		}

		RoomParticipantEntity participant=roomParticipantRepository.findByRoomAndSessionId(room,sessionId).orElse(null);
		if (participant == null) return;
		boolean isHost="HOST".equals(participant.getRole());
		roomParticipantRepository.delete(participant);
		if(isHost) {
			roomParticipantRepository.deleteAllByRoom(room);
			roomRepository.delete(room);
			roomStore.removeRoom(roomCode);
			return;
		}
		if(roomParticipantRepository.findByRoom(room).isEmpty()) {
			roomRepository.delete(room);
			roomStore.removeRoom(roomCode);
		}
	}

	@Override
	@Transactional
	public void deleteRoomCompletely(String roomCode) {
		// TODO Auto-generated method stub
		Optional<RoomEntity> optionalRoom = roomRepository.findByRoomCode(roomCode);

		if (optionalRoom.isEmpty()) {
		    System.out.println("Room not found during disconnect. Ignoring.");
		    return;
		}

		RoomEntity room = optionalRoom.get();
		roomParticipantRepository.deleteAllByRoom(room);
		room.setStatus("CLOSED");
		roomRepository.delete(room);
		
	}

	@Override
	@Transactional
	public void addParticipantToDB(String roomCode, String userId, String sessionId, String role, String displayName) {
		// TODO Auto-generated method stub
		RoomEntity room=roomRepository.findByRoomCode(roomCode).orElse(null);
		if(room==null) return;
//		boolean exists = roomParticipantRepository
//	            .existsByRoomAndSessionId(room, sessionId);
//
//	    if (exists) return;
		roomParticipantRepository.deleteByRoomAndDisplayName(room, displayName);
		
	    if (displayName == null || displayName.isBlank()) {
	        displayName = "Guest";
	    }

	    RoomParticipantEntity participant = new RoomParticipantEntity();
	    participant.setRoom(room);
	    participant.setSessionId(sessionId);   
	    participant.setDisplayName(displayName);
	    participant.setRole(role);
	    participant.setJoinedAt(LocalDateTime.now());

	    roomParticipantRepository.save(participant);
	    System.out.println("Participant saved: " + displayName + " -> " + sessionId);
		
		
		
	}


}
