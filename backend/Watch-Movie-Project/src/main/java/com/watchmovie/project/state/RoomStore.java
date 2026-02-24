package com.watchmovie.project.state;

import java.util.Collection;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

import com.watchmovie.project.entity.RoomEntity;

@Component
public class RoomStore {
	private final Map<String,Room> rooms=new ConcurrentHashMap<>();
	public void addRoom(String roomId, Room socketRoom) {
	    rooms.put(roomId, socketRoom);
	}

	public Room getRoom(String roomId) {
		return rooms.get(roomId);
	}

	public void addRoom(Room room) {
		rooms.put(room.getRoomId(), room);
	}
	public void deleteRoom(String roomId) {
		rooms.remove(roomId);
	}
	public boolean roomExists(String roomId) {
		return rooms.containsKey(roomId);
	}
	
	public Collection<Room> getAllRooms() {
        return rooms.values();
    }
	public void removeRoom(String roomCode) {
	    rooms.remove(roomCode);
	}
	
}
