package com.watchmovie.project.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.watchmovie.project.entity.RoomEntity;
@Repository
public interface RoomRepository extends JpaRepository<RoomEntity, Long>{
	Optional<RoomEntity> findByRoomCode(String roomCode);
	boolean existsByRoomName(String roomName);

}
