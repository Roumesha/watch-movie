package com.watchmovie.project.service;


import java.util.List;

import org.springframework.core.io.support.ResourceRegion;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import com.watchmovie.project.dto.MovieDTO;
import com.watchmovie.project.entity.MovieEntity;


public interface MovieService {
	void uploadMovie(MultipartFile movie,long userId);
	ResponseEntity<byte[]> streamMovie(Long movieId,String rangeHeader);
	List<MovieDTO> getMoviesByUser(Long userId);

}
