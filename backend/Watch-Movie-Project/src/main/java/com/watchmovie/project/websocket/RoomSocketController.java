package com.watchmovie.project.websocket;

import java.util.Map;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.watchmovie.project.dto.ParticipantDTO;
import com.watchmovie.project.dto.RoomSyncRequest;
import com.watchmovie.project.entity.RoomEntity;
import com.watchmovie.project.service.RoomService;
import com.watchmovie.project.state.Room;
import com.watchmovie.project.state.RoomStore;

import jakarta.annotation.PostConstruct;

import com.watchmovie.project.state.Participant;
import com.watchmovie.project.state.Role;

@Controller
public class RoomSocketController {
	@Autowired
	private SimpMessagingTemplate messagingTemplate;
	
	@Autowired
	private RoomService roomService;
	
	@Autowired 
	private RoomStore roomStore;
	
	@PostConstruct
	public void testLoaded() {
	    System.out.println("RoomSocketController LOADED");
	}

	
	@MessageMapping("/room/{roomCode}/sync")
	public void syncRoom(@DestinationVariable Long roomId,RoomSyncRequest message) {
		roomService.syncRoom(roomId, message.isPlaying(), message.getCurrentTime());
		messagingTemplate.convertAndSend("/topic/room/"+roomId,message);
	}
	
	@MessageMapping("/room/{roomCode}/join")
	public void joinRoom(@DestinationVariable String roomCode,SimpMessageHeaderAccessor accessor,JoinMessage message) {
		String sessionId=accessor.getSessionId();
		Room room=roomStore.getRoom(roomCode);
		if (room == null) {

	        var roomEntity = roomService.findByRoomCode(roomCode);

	        if (roomEntity == null) {
	            System.out.println("Room not found in DB: " + roomCode);
	            return;
	        }
	        room =new Room(roomCode);
	        room.setPlaying(roomEntity.getIsPlaying());
	        room.setCurrentTime(roomEntity.getCurrentTimePlayer());
	        roomStore.addRoom(roomCode,room);
	        System.out.println("Rebuilt memory room: " + roomCode);
		}
		

		Role role = Role.valueOf(message.getRole());
		String displayName = message.getDisplayName() == null || message.getDisplayName().isBlank() 
                ? "Guest" : message.getDisplayName();
		room.getParticipants().values()
		.removeIf(p->p.getDisplayName().equals(displayName));
		
		 // Avoid duplicate join
        
            Participant participant = new Participant(message.getUserId(), sessionId, role);
            participant.setDisplayName(displayName);
            room.getParticipants().put(sessionId, participant);

            roomService.addParticipantToDB(roomCode, message.getUserId(), sessionId, role.name(), displayName);
        
		 
		
		if (role == Role.HOST) {
	        room.setHostSessionId(sessionId);
	    }
		List<ParticipantDTO> list=room.getParticipants()
				.values().stream().map(p-> new ParticipantDTO(
						p.getDisplayName(),
						p.getRole().name()
						)).toList();
		
//		messagingTemplate.convertAndSend("/topic/participants/"+roomCode,list);
		
		System.out.println("User joined room: " + roomCode);
		broadcastParticipants(roomCode, room);

	}
	
	//HOST play/pause/seek
	@MessageMapping("/room/{roomCode}/control")
//	@SendTo("/topic/room/{roomId}")
	public void control(@DestinationVariable String roomCode,ControlMessage message,SimpMessageHeaderAccessor accessor) {
		Room room=roomStore.getRoom(roomCode);
		if(room==null) return;
		Participant sender=room.getParticipants().get(accessor.getSessionId());
		

		if(sender==null || !sender.isHost()) return;
		room.setPlaying(message.isPlaying());
		room.setCurrentTime(message.getTime());
		System.out.println("CONTROL RECEIVED: " + message);

		
		messagingTemplate.convertAndSend("/topic/room/"+roomCode,message);
	}
	
	//Late join/reconnect sync
	@MessageMapping("/room/{roomCode}/sync-request")
	public void syncRequest(@DestinationVariable String roomCode,SimpMessageHeaderAccessor accessor) {
		Room room=roomStore.getRoom(roomCode);
		if(room==null) return;
		messagingTemplate.convertAndSendToUser(accessor.getSessionId(), "/queue/sync",
				Map.of("type","SYNC",
						"playing",room.isPlaying(),
						"time",room.getCurrentTime()));
	}
	
	 private void broadcastParticipants(String roomCode, Room room) {
	        List<ParticipantDTO> list = room.getParticipants().values().stream()
	                .map(p -> new ParticipantDTO(p.getDisplayName(), p.getRole().name()))
	                .toList();
	        messagingTemplate.convertAndSend("/topic/participants/" + roomCode, list);
	    }
	 
	 @MessageMapping("/room/{roomCode}/leave")
	 public void leaveRoom(@DestinationVariable String roomCode,
	                       SimpMessageHeaderAccessor accessor,
	                       LeaveMessage message) {
	     String sessionId = accessor.getSessionId();
	     Room room = roomStore.getRoom(roomCode);
	     if (room == null) return;

	     Participant removed = room.getParticipants().remove(sessionId);
	     if (removed != null) {
	         roomService.removeParticipantFromDB(roomCode, removed.getSessionId());

	         // If host leaves, close room
	         if (removed.getRole() == Role.HOST) {
	             roomService.deleteRoomCompletely(roomCode);
	             roomStore.deleteRoom(room.getRoomId());
	             messagingTemplate.convertAndSend(
	                 "/topic/room/" + room.getRoomId()
	             );
	             return;
	         }

	         // If no participants left, delete room
	         if (room.getParticipants().isEmpty()) {
	             roomService.deleteRoomCompletely(roomCode);
	             roomStore.deleteRoom(room.getRoomId());
	             return;
	         }

	         // Broadcast updated list
	         broadcastParticipants(roomCode, room);
	     }
	 }



}
