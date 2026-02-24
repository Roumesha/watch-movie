package com.watchmovie.project.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.watchmovie.project.entity.RoomEntity;
import com.watchmovie.project.entity.RoomParticipantEntity;
import com.watchmovie.project.entity.UserEntity;

@Repository
public interface RoomParticipantRepository extends JpaRepository<RoomParticipantEntity, Long>{
	List<RoomParticipantEntity> findByRoom(RoomEntity room);
	List<RoomParticipantEntity> findByRoomId(Long roomId);
//	void deleteByRoomAndUser(RoomEntity room,UserEntity user);
	boolean existsByRoomAndSessionId(RoomEntity room, String sessionId);
	Optional<RoomParticipantEntity> findByRoomAndSessionId(RoomEntity room, String sessionId);
	void deleteByRoomAndSessionId(RoomEntity room,String sessionId);
	void deleteAllByRoom(RoomEntity room);
	void deleteBySessionId(String sessionId);

}
