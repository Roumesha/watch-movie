package com.watchmovie.project.repository;

import java.util.List;

import org.springframework.data.repository.CrudRepository;

import com.watchmovie.project.dto.MovieDTO;
import com.watchmovie.project.entity.MovieEntity;

public interface MovieRepository extends CrudRepository<MovieEntity, Long>{
	List<MovieDTO> findByOwnerId(Long ownerId);
}
