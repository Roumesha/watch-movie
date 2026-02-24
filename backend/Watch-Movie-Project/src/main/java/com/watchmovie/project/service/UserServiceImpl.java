package com.watchmovie.project.service;

import org.springframework.beans.factory.annotation.Autowired;

import com.watchmovie.project.dto.LoginRequestDTO;
import com.watchmovie.project.dto.RegisterRequestDTO;
import com.watchmovie.project.dto.UserDTO;
import com.watchmovie.project.entity.UserEntity;
import com.watchmovie.project.repository.UserRepository;
import com.watchmovie.project.util.JwtUtil;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService{

	@Autowired
	private UserRepository userRepository;
	
	@Autowired
	private JwtUtil jwtUtil;
	
	private BCryptPasswordEncoder passwordEncoder=new BCryptPasswordEncoder();
	@Override
	public UserDTO registerUser(RegisterRequestDTO request) {
		if(userRepository.existsByEmail(request.getEmail())) {
			throw new RuntimeException("Email already registered");
		}
		UserEntity user=new UserEntity();
		user.setUsername(request.getUsername());
		user.setEmail(request.getEmail());
		user.setPassword(passwordEncoder.encode(request.getPassword()));
		userRepository.save(user);
		
		return new UserDTO(user.getId(),user.getUsername(),user.getEmail(),user.getRole());
	}

	@Override
	public String loginUser(LoginRequestDTO request) {
		
		UserEntity user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        // Generate JWT
        return jwtUtil.generateToken(user.getId(), user.getEmail());
	}

}
