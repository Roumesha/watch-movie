package com.watchmovie.project.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.watchmovie.project.dto.LoginRequestDTO;
import com.watchmovie.project.dto.RegisterRequestDTO;
import com.watchmovie.project.service.UserService;

@RestController
@RequestMapping("/user")
public class UserApi {
	 private final UserService userService;

	    public UserApi(UserService userService) {
	        this.userService = userService;
	    }
	
	@PostMapping("/register")
	public ResponseEntity<String> register(@RequestBody RegisterRequestDTO request){
		userService.registerUser(request);
		return ResponseEntity.ok("User Registered successfully");
	}
	
	@PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequestDTO request) {
        String token = userService.loginUser(request);
        return ResponseEntity.ok(token);
    }
}
