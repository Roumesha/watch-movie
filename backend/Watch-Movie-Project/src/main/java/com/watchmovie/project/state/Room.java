package com.watchmovie.project.state;

import java.util.*;
import java.util.concurrent.*;
public class Room {
	private String roomId;
	private Long hostId;
	private String hostSessionId;
	private boolean isPlaying;
	private double currentTime;
	public Room() {}
	
	public Room(String roomId) {
		this.roomId=roomId;
	}

    public Room(String roomId, Long hostId, String hostSessionId) {
        this.roomId = roomId;
        this.hostId = hostId;
        this.hostSessionId = hostSessionId;
        this.isPlaying = false;
        this.currentTime = 0;
    }

	private Map<String,Participant> participants=new ConcurrentHashMap<>();
	public String getRoomId() {
		return roomId;
	}
	public void setRoomId(String roomId) {
		this.roomId = roomId;
	}
	public Long getHostId() {
		return hostId;
	}
	public void setHostId(Long hostId) {
		this.hostId = hostId;
	}
	public String getHostSessionId() {
		return hostSessionId;
	}
	public void setHostSessionId(String hostSessionId) {
		this.hostSessionId = hostSessionId;
	}
	public boolean isPlaying() {
		return isPlaying;
	}
	public void setPlaying(boolean isPlaying) {
		this.isPlaying = isPlaying;
	}
	public double getCurrentTime() {
		return currentTime;
	}
	public void setCurrentTime(double currentTime) {
		this.currentTime = currentTime;
	}
	public Map<String, Participant> getParticipants() {
		return participants;
	}
	public void setParticipants(Map<String, Participant> participants) {
		this.participants = participants;
	}
}
