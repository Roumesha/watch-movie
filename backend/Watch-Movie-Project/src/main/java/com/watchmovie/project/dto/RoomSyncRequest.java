package com.watchmovie.project.dto;

public class RoomSyncRequest {
	private boolean playing;
	
	private double currentTime;
	
	public boolean isPlaying() {
		return playing;
	}
	public void setPlaying(boolean playing) {
		this.playing = playing;
	}
	public double getCurrentTime() {
		return currentTime;
	}
	public void setCurrentTime(double currentTime) {
		this.currentTime = currentTime;
	}
	
}
