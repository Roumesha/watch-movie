package com.watchmovie.project.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.core.io.support.ResourceRegion;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import org.springframework.http.HttpHeaders;
import java.io.IOException;
import java.nio.file.Files;
import java.io.RandomAccessFile;
import java.net.http.HttpRequest;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;

import com.watchmovie.project.dto.MovieDTO;
import com.watchmovie.project.entity.*;

import com.watchmovie.project.repository.MovieRepository;
import com.watchmovie.project.repository.UserRepository;

@Service
public class MovieServiceImpl implements MovieService{

	@Value("${movie.upload.dir}")
	private String uploadDir;
	
	@Autowired
	private MovieRepository movieRepository;
	
	@Autowired
	private UserRepository userRepository;

	
	@Override
	public void uploadMovie(MultipartFile movie, long userId) {
		if(movie.isEmpty()) {
			throw new RuntimeException("Movie file is empty");
		}
		
		if(!movie.getOriginalFilename().endsWith(".mp4")) {
			throw new RuntimeException("Only MP4 files are allowed");
		}
		
		try {
			String userFolderPath=Paths.get(uploadDir, "user_" + userId).toString();
			File userFolder=new File(userFolderPath);
			
			if(!userFolder.exists()) {
				userFolder.mkdirs();
			}
			
			String filePath=userFolderPath +"/"+movie.getOriginalFilename();
			Files.copy(movie.getInputStream(), Paths.get(filePath),StandardCopyOption.REPLACE_EXISTING);
			
			UserEntity user=userRepository.findById(userId).orElseThrow(()->new RuntimeException("User not found"));
			MovieEntity movieEntity=new MovieEntity();
			movieEntity.setTitle(movie.getOriginalFilename());
			movieEntity.setFilePath(filePath);
			movieEntity.setOwner(user);
			movieEntity.setDuration(0);
			
			movieRepository.save(movieEntity);
			
		}
		catch(IOException e){
			throw new RuntimeException("Movie upload failed");
		}
		
	}


	@Override
	public ResponseEntity<byte[]> streamMovie(Long movieId, String rangeHeader) {
		MovieEntity movie=movieRepository.findById(movieId).orElseThrow(()->new RuntimeException("Movie not found"));
		File file=new File(movie.getFilePath());
		try (RandomAccessFile raf=new RandomAccessFile(file,"r")){
			
			
			long fileSize=raf.length();
			long start=0;
			long end=fileSize-1;
			
			if(rangeHeader!=null && rangeHeader.startsWith("bytes=")) {
				String[] ranges=rangeHeader.replace("bytes=","").split("-");
				start=Long.parseLong(ranges[0]);
				if(ranges.length>1 && !ranges[1].isEmpty()) {
					end=Long.parseLong(ranges[1]);
				}
			}
			long contentLength=end-start+1;
			
			byte[] data=new byte[(int)contentLength];
			raf.seek(start);
			raf.readFully(data);
			
			HttpHeaders headers=new HttpHeaders();
			headers.setContentType(MediaType.valueOf("video/mp4"));
			headers.set(HttpHeaders.ACCEPT_RANGES,"bytes");
			headers.set(HttpHeaders.CONTENT_RANGE,"bytes "+start+"-"+end+"/"+fileSize);
			headers.setContentLength(contentLength);
			
			
			return new ResponseEntity<>(data,headers,HttpStatus.PARTIAL_CONTENT);
			
		}
		catch(Exception e) {
			throw new RuntimeException("Error while streaming movie");
		}
	}


	@Override
	public List<MovieDTO> getMoviesByUser(Long userId) {
		// TODO Auto-generated method stub
		return movieRepository.findByOwnerId(userId)
				.stream().map(p->new MovieDTO(
						p.getId(),
						p.getTitle(),
						p.getDuration()))
				.toList();
	}

}
