package com.watchmovie.project.service;

import java.util.List;

import com.watchmovie.project.dto.CreateRoomRequest;
import com.watchmovie.project.dto.JoinRoomRequest;
import com.watchmovie.project.dto.RoomResponseDTO;
import com.watchmovie.project.entity.RoomEntity;
import com.watchmovie.project.entity.RoomParticipantEntity;

public interface RoomService {
	RoomEntity createRoom(CreateRoomRequest request);
	RoomResponseDTO joinRoom(JoinRoomRequest request);
	List<RoomParticipantEntity> getParticipants(Long roomId);
	void leaveRoom(Long roomId,String sessionId);
	void syncRoom(Long roomId,boolean playing,double currentTime);
	RoomEntity findByRoomCode(String roomCode);
	void removeParticipantFromDB(String roomCode,String sessionId);
	void deleteRoomCompletely(String roomCode);
	void addParticipantToDB(String roomCode, String userId, String sessionId, String role, String displayName);
	
}
