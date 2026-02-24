package com.watchmovie.project.dto;

public class UserDTO {
	private Long id;
	private String username;
	private String email;
	private String role;
	
	public UserDTO(Long id,String username, String email,String role) {
		this.setId(id);
		this.setEmail(email);
		this.setUsername(username);
		this.setRole(role);
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getRole() {
		return role;
	}

	public void setRole(String role) {
		this.role = role;
	}
}
