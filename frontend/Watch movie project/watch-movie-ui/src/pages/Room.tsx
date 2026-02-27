import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "../pages/Room.css";
import RoomDetails from "./RoomDetails";
import Participants from "./Participants";
import Chat from "./Chat";
import type { RoomData, RoomParticipant, RoomType, SyncMessage } from "./types";
import axio from "../api/axio";
import IconButton from "./IconButton";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getUserId } from "../pages/session";
import { useToast } from "./useToast";

function Room() {
  const { roomId } = useParams();
  const { state } = useLocation() as { state: RoomType };
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [showDetails, setShowDetails] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [participants, setParticipants] = useState<RoomParticipant[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [rooms, setRooms] = useState<RoomData | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
//   const [activePanel, setActivePanel] = useState<
//   "invite" | "details" | "participants" | "chat" | null
// >(null);

  const room: RoomType = state;
  const videoRef = useRef<HTMLVideoElement>(null);
  const clientRef = useRef<Client | null>(null);

  const userId = localStorage.getItem("userId") || getUserId();

  const handleSync = (data: SyncMessage) => {
    if (!videoRef.current) return;
    setIsSyncing(true);
    const video = videoRef.current;
    const timeDiff = Math.abs(video.currentTime - data.time);

    if (timeDiff > 0.5) {
      video.currentTime = data.time;
    }
    if (data.playing) {
      video.play().catch((error) => console.log("Autoplay blocked:", error));
    } else {
      video.pause();
    }
    setTimeout(() => setIsSyncing(false), 500);
  };

  const handleInvite = () => {
  navigator.clipboard.writeText(`${window.location.origin}/room/${roomId}`);
  showToast("Invite link copied to clipboard 📋", "info");
};


  const isHost = () => {
    const uid = getUserId();
    return rooms?.host?.id && String(rooms.host.id) === String(uid);
  };

  useEffect(() => {
    if (!roomId) return;
    axio.get(`/rooms/getRoom/${roomId}`).then((res) => setRooms(res.data));
    axio.get(`/rooms/${roomId}/participants`).then((res) =>
      setParticipants(res.data)
    );
  }, [roomId]);

  useEffect(() => {
    if (!roomId || !rooms || !userId) return;

    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      reconnectDelay: 5000,
      onConnect: (frame) => {
        const stompSession = frame.headers["session"];
        if (stompSession) {
          localStorage.setItem("sessionId", stompSession);
        }
        const currentSessionId = localStorage.getItem("sessionId");
        console.log("Connected to websocket with sessionId:", currentSessionId);

        const displayName = localStorage.getItem("displayName") || "Guest";

        client.subscribe(`/topic/room/${room.roomCode}`, (message) => {
          const data: SyncMessage = JSON.parse(message.body);
          handleSync(data);
        });

        // JOIN room
        client.publish({
          destination: `/app/room/${room.roomCode}/join`,
          body: JSON.stringify({
            userId,
            sessionId: currentSessionId,
            role: isHost() ? "HOST" : "VIEWER",
            displayName,
          }),
        });

        // REQUEST SYNC
        client.publish({
          destination: `/app/room/${room.roomCode}/sync-request`,
          body: "",
        });

        // Participant updates
        client.subscribe(`/topic/participants/${room.roomCode}`, (message) => {
          const updatedList : RoomParticipant[] = JSON.parse(message.body);
          const prev = participants;
         

            //detect join
            if(updatedList.length>prev.length){
              const newUser=updatedList.find(
                (u:RoomParticipant)=>!prev.some((p: RoomParticipant)=>p.id===u.id)
              )
              if(newUser){
                showToast(`${newUser.displayName} joined the room 👋`, "info");
              }
            }

            // Detect leave
    if (updatedList.length < prev.length) {
      const leftUser = prev.find(
        (p: RoomParticipant) => !updatedList.some((u: RoomParticipant) => u.id === p.id)
      );
      if (leftUser) {
        showToast(`${leftUser.displayName} left the room 🚪`, "error");
      }
    }
    setParticipants(updatedList);
    
          });
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate().catch((err) =>
        console.log("Error during cleanup:", err)
      );
    };
  }, [roomId, rooms, userId]);

  const sendControl = (playing: boolean) => {
    if (!videoRef.current || !clientRef.current || !clientRef.current.connected) {
      console.log("CLIENT NOT READY");
      return;
    }
    clientRef.current.publish({
      destination: `/app/room/${room.roomCode}/control`,
      body: JSON.stringify({
        playing,
        time: videoRef.current.currentTime,
      }),
    });
  };

  const handleLeave = async () => {
  try {
    if (clientRef.current && clientRef.current.connected) {
      clientRef.current.publish({
        destination: `/app/room/${room.roomCode}/leave`,
        body: JSON.stringify({
          userId,
          displayName: localStorage.getItem("displayName") || "Guest",
        }),
      });
      await clientRef.current.deactivate();
    }
  } catch (err) {
    console.log("Leave failed", err);
  } finally {
    showToast("You left the room", "info");
    navigate("/");
  }
};

  if (!rooms || !rooms.movie.id) return null;

  return (
    <div className="vh-100 position-relative bg-black">
      {!hasInteracted && (
        <div
          className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark"
          style={{ zIndex: 10 }}
        >
          <button
            className="btn btn-light"
            onClick={() => {
              setHasInteracted(true);
              videoRef.current?.play().catch(() => {});
            }}
          >
            Click to start Watching
          </button>
        </div>
      )}
      <video
        ref={videoRef}
        className="w-100 h-100"
        controls={!!isHost()}
        preload="auto"
        src={`http://localhost:8080/movies/stream/${rooms?.movie.id}`}
        onPlay={() => {
          if (!isHost() || isSyncing) return;
          sendControl(true);
        }}
        onPause={() => {
          if (!isHost() || isSyncing) return;
          sendControl(false);
        }}
        onSeeked={() => {
          if (!isHost() || isSyncing || !videoRef.current) return;
          sendControl(!videoRef.current.paused);
        }}
      />

      <div className="sidebar">
  <IconButton label="Invite Friends" onClick={handleInvite}>📋</IconButton>
  <IconButton label="Room Info" onClick={() => setShowDetails(true)}>ℹ️</IconButton>
  {/* <IconButton label={`Participants (${participants.length})`} onClick={() => setShowParticipants(true)}>👥</IconButton> */}
  <button className="icon-btn" onClick={()=>setShowParticipants(true)}>
  👥
  {participants.length > 0 && (
    <div className="icon-badge">
      {participants.length}
    </div>
  )}
  <span>Participants</span>
</button>
  <IconButton label="Chat" onClick={() => setShowChat(true)}>💬</IconButton>
  <IconButton label="Leave Room" danger onClick={handleLeave}>🚪</IconButton>
</div>





      {showDetails &&
       ( <div className="side-panel">
         <RoomDetails room={room} 
         onClose={() => setShowDetails(false)} 
         participantCount={participants.length} />
          </div> )}
      {showParticipants && 
      ( <div className="side-panel"> 
      <Participants roomId={roomId!} 
      onClose={() => setShowParticipants(false)}
       /> </div>
        )}
         {showChat && ( 
          <div className="side-panel"> 
          <Chat roomId={roomId!} 
          onClose={() => setShowChat(false)} /> </div> )}
     
    </div>
  );
}

export default Room;
