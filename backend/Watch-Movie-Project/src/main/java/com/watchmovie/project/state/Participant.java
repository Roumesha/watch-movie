package com.watchmovie.project.state;

public class Participant {
	private String userId;
	private String sessionId;
	private String displayName;
	private Role role;
	public Participant(String userId, String sessionId, Role role) {
        this.userId = userId;
        this.sessionId = sessionId;
        this.role = role;
    }
	public String getUserId() {
		return userId;
	}
	public void setUserId(String userId) {
		this.userId = userId;
	}
	public String getSessionId() {
		return sessionId;
	}
	public void setSessionId(String sessionId) {
		this.sessionId = sessionId;
	}
	public Role getRole() {
		return role;
	}
	public void setRole(Role role) {
		this.role = role;
	}
	public boolean isHost() {
        return role == Role.HOST;
    }
	public String getDisplayName() {
		return displayName;
	}
	public void setDisplayName(String displayName) {
		this.displayName = displayName;
	}
	
}
