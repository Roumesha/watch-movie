package com.watchmovie.project.dto;

public class RoomResponseDTO {
    private Long roomId;
    private String roomName;
    private String roomCode;
    private boolean isPlaying;
    private double currentTime;
    private Long movieId; 
	public RoomResponseDTO(Long roomId, String roomName, String roomCode, boolean isPlaying, double currentTime,Long movieId) {
		super();
		this.roomId = roomId;
		this.roomName = roomName;
		this.roomCode = roomCode;
		this.isPlaying = isPlaying;
		this.currentTime = currentTime;
		this.movieId=movieId;
	}
	public Long getRoomId() {
		return roomId;
	}
	public void setRoomId(Long roomId) {
		this.roomId = roomId;
	}
	public String getRoomName() {
		return roomName;
	}
	public void setRoomName(String roomName) {
		this.roomName = roomName;
	}
	public String getRoomCode() {
		return roomCode;
	}
	public void setRoomCode(String roomCode) {
		this.roomCode = roomCode;
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
	public Long getMovieId() {
		return movieId;
	}
	public void setMovieId(Long movieId) {
		this.movieId = movieId;
	}

    // constructor
    // getters
}
