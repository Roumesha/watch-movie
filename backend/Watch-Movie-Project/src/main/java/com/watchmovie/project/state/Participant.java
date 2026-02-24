package com.watchmovie.project.state;

public class Participant {
	private Long userId;
	private String sessionId;
	private Role role;
	public Participant(Long userId, String sessionId, Role role) {
        this.userId = userId;
        this.sessionId = sessionId;
        this.role = role;
    }
	public Long getUserId() {
		return userId;
	}
	public void setUserId(Long userId) {
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
}
