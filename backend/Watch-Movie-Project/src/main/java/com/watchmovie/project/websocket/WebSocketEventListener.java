package com.watchmovie.project.websocket;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import com.watchmovie.project.dto.ParticipantDTO;
import com.watchmovie.project.repository.RoomParticipantRepository;
import com.watchmovie.project.service.RoomService;
import com.watchmovie.project.state.Participant;
import com.watchmovie.project.state.Role;
import com.watchmovie.project.state.Room;
import com.watchmovie.project.state.RoomEvent;
import com.watchmovie.project.state.RoomStore;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class WebSocketEventListener {
	@Autowired
	private RoomStore roomStore;
	@Autowired
	private RoomService roomService;
	@Autowired
	private RoomParticipantRepository roomParticipantRepository;
	@Autowired
	private SimpMessagingTemplate messagingTemplate;
	@EventListener
	public void handleDisconnect(SessionDisconnectEvent event) {
		String sessionId=event.getSessionId();
		System.out.println(sessionId);
		if (sessionId == null) return;
		
		for(Room room:new ArrayList<>(roomStore.getAllRooms())) {
			Participant participant =room.getParticipants().remove(sessionId);
			if(participant==null) continue;
			String roomCode=room.getRoomId();
			roomService.removeParticipantFromDB(roomCode, sessionId);
			
			//Case1 HOST left
			if(participant.getRole()==Role.HOST) {
				roomService.deleteRoomCompletely(roomCode);
				roomStore.deleteRoom(room.getRoomId());
				messagingTemplate.convertAndSend(
					    "/topic/room/" + room.getRoomId(),
					    new RoomEvent("ROOM_CLOSED")
					);

				continue;
			}
			
			//Case2 No participant left
			if(room.getParticipants().isEmpty()) {
				roomService.deleteRoomCompletely(roomCode);
				roomStore.deleteRoom( room.getRoomId());
				return;
			}

		   
//			roomParticipantRepository.deleteBySessionId(sessionId);
			
			 
			 
			// Broadcast updated participant list
			 List<ParticipantDTO> list = room.getParticipants()
			         .values()
			         .stream()
			         .map(p ->  new ParticipantDTO(
			        	    		p.getDisplayName(), 
			        	            p.getRole().name())
			        	)
			        	
			        	.toList();

			 messagingTemplate.convertAndSend(
			         "/topic/participants/" + roomCode,
			         list
			 );

		}
	}
}
