package com.watchmovie.project.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.watchmovie.project.dto.MovieDTO;
import com.watchmovie.project.entity.MovieEntity;
import com.watchmovie.project.service.MovieService;

@CrossOrigin
@RestController
@RequestMapping("/movies")
public class MovieApi {
	@Autowired
	private MovieService movieService;
	
	@PostMapping("/upload")
	public ResponseEntity<String> uploadMovie(@RequestParam("movie") MultipartFile movie,@RequestParam("userId") Long userId){
		movieService.uploadMovie(movie, userId);
		return ResponseEntity.ok("Movie uploaded successfully");
	}
	
	@GetMapping(value="/stream/{movieId}",produces="video/mp4")
	public ResponseEntity<byte[]> streamMovie(@PathVariable Long movieId,@RequestHeader(value="Range",required=false) String rangeHeader){
		return movieService.streamMovie(movieId, rangeHeader);
	}
	
	@GetMapping("/user/{userId}")
    public List<MovieDTO> getUserMovies(@PathVariable Long userId) {
        return movieService.getMoviesByUser(userId);
    }
}
