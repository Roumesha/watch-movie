package com.watchmovie.project.dto;

public class ParticipantDTO {
	String displayName;
	String role;
	public ParticipantDTO(String displayName, String role) {
		// TODO Auto-generated constructor stub
		this.displayName=displayName;
		this.role=role;
	}
	public String getDisplayName() {
		return displayName;
	}
	public void setDisplayName(String displayName) {
		this.displayName = displayName;
	}
	public String getRole() {
		return role;
	}
	public void setRole(String role) {
		this.role = role;
	}
	

}
