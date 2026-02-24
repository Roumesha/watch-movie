package com.watchmovie.project.service;

import com.watchmovie.project.dto.LoginRequestDTO;
import com.watchmovie.project.dto.RegisterRequestDTO;
import com.watchmovie.project.dto.UserDTO;

public interface UserService {
	UserDTO registerUser(RegisterRequestDTO registerRequestDto);
	String loginUser(LoginRequestDTO loginRequestDto);
}
