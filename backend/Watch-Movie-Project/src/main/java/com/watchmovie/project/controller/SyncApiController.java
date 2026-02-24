package com.watchmovie.project.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.watchmovie.project.dto.SyncMessageDTO;

@Controller
public class SyncApiController {
	@Autowired
	private SimpMessagingTemplate messagingTemplate;
	@MessageMapping("/sync/{roomId}")
	public void syncVideo(@DestinationVariable String roomId,SyncMessageDTO message) {
		messagingTemplate.convertAndSend("/topic/room/"+roomId,message);
	}

}
