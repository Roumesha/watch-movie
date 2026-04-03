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
import { BASE_URL } from "../config";

function Room() {
  const { roomId } = useParams();
  const { state } = useLocation() as { state: RoomType };
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [activePanel, setActivePanel] = useState<
    "details" | "participants" | "chat" | null
  >(null);

  const [participants, setParticipants] = useState<RoomParticipant[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [rooms, setRooms] = useState<RoomData | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  // const room: RoomType = state;
  const [room, setRoom] = useState<RoomType | null>(state || null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const clientRef = useRef<Client | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const userId = localStorage.getItem("userId") || getUserId();

  const togglePanel = (panel: "details" | "participants" | "chat") => {
    setActivePanel((prev) => (prev === panel ? null : panel));
  };

 const toggleFullscreen = async () => {
  if (!containerRef.current) return;

  if (!document.fullscreenElement) {
    await containerRef.current.requestFullscreen();
    setIsFullscreen(true);
  } else {
    await document.exitFullscreen();
    setIsFullscreen(false);
  }
};

  const togglePlayPause = () => {
  if (!videoRef.current) return;

  const video = videoRef.current;

  if (video.paused) {
    video.play().catch(() => {});
  } else {
    video.pause();
  }
};

const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Prevent clicks from sidebar, buttons, or other elements
    if (e.target !== e.currentTarget) return;

    togglePlayPause();
  };


useEffect(() => {
  const handleChange = () => {
    setIsFullscreen(!!document.fullscreenElement);
  };

  document.addEventListener("fullscreenchange", handleChange);

  return () => {
    document.removeEventListener("fullscreenchange", handleChange);
  };
}, []);

  const handleSync = (data: SyncMessage) => {
    if (!videoRef.current) return;

    setIsSyncing(true);
    const video = videoRef.current;

    const timeDiff = Math.abs(video.currentTime - data.time);

    if (timeDiff > 0.5) {
      video.currentTime = data.time;
    }

    if (data.playing) {
      video.play().catch((err) => console.log("Autoplay blocked", err));
    } else {
      video.pause();
    }

    setTimeout(() => setIsSyncing(false), 500);
  };

  const handleInvite = () => {
    navigator.clipboard.writeText(`${window.location.origin}/room/${roomId}`);
    showToast("Invite link copied 📋", "info");
  };

  const isHost = () => {
    const uid = getUserId();
    return rooms?.host?.id && String(rooms.host.id) === String(uid);
  };

  useEffect(() => {
    if (!roomId) return;

    axio.get(`/rooms/getRoom/${roomId}`).then((res) => {
    setRooms(res.data);

    // ✅ fallback if state is missing
    if (!room) {
      setRoom({
        id: res.data.id,
        roomName: res.data.roomName,
        roomCode: res.data.roomCode,
        host: res.data.host,
        movieId: res.data.movie.id,
        currentTime: res.data.currentTimePlayer,
      });
    }
  });

    axio
      .get(`/rooms/${roomId}/participants`)
      .then((res) => setParticipants(res.data));

      
  }, [roomId]);

  useEffect(() => {
    if (!roomId || !rooms || !userId) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(`${BASE_URL}/ws`),

      reconnectDelay: 5000,

      onConnect: (frame) => {
        const stompSession = frame.headers["session"];

        if (stompSession) {
          localStorage.setItem("sessionId", stompSession);
        }

        const currentSessionId = localStorage.getItem("sessionId");

        console.log("Connected with sessionId:", currentSessionId);

        const displayName = isHost()
  ? rooms?.host?.email?.split('@')[0]||"HOST"
  : localStorage.getItem("displayName") || "Guest";

if (!room) return ;

        client.subscribe(`/topic/room/${room.roomCode}`, (message) => {
          const data: SyncMessage = JSON.parse(message.body);
          handleSync(data);
        });

        client.publish({
          destination: `/app/room/${room.roomCode}/join`,
          body: JSON.stringify({
            userId,
            sessionId: currentSessionId,
            role: isHost() ? "HOST" : "VIEWER",
            displayName,
          }),
        });

        client.publish({
          destination: `/app/room/${room.roomCode}/sync-request`,
          body: "",
        });

        client.subscribe(`/topic/participants/${room.roomCode}`, (message) => {
          const updatedList: RoomParticipant[] = JSON.parse(message.body);

          const prev = participants;

          if (updatedList.length > prev.length) {
            const newUser = updatedList.find(
              (u) => !prev.some((p) => p.id === u.id)
            );

            if (newUser) {
              showToast(`${newUser.displayName} joined 👋`, "info");
            }
          }

          if (updatedList.length < prev.length) {
            const leftUser = prev.find(
              (p) => !updatedList.some((u) => u.id === p.id)
            );

            if (leftUser) {
              showToast(`${leftUser.displayName} left 🚪`, "error");
            }
          }

          setParticipants(updatedList);
        });
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate().catch((err) => console.log("Cleanup error", err));
    };
  }, [roomId, rooms, userId]);

  const sendControl = (playing: boolean) => {
    if (!videoRef.current || !clientRef.current?.connected) return;
    if (!room) return ;
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
      if (!room) return ;
      if (clientRef.current?.connected) {
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
      console.log(err);
    } finally {
      showToast("You left the room", "info");
      navigate("/");
    }
  };

  if (!rooms || !rooms.movie.id) return null;

  return (
    <div ref={containerRef} className="vh-100 position-relative bg-black" onClick={togglePlayPause}>
      {!hasInteracted && (
        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark"
        style={{ zIndex: 10 }}>
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
  <div  className="video-container" onClick={handleClick}>
      <video
        ref={videoRef}
        className="w-100 h-100"
        controls={!!isHost()}
        controlsList="nofullscreen noplaybackrate nodownload"
        disablePictureInPicture
         playsInline
         webkit-playsinline="true"
        preload="auto"
        src={`${BASE_URL}/movies/stream/${rooms?.movie.id}`}
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

      <div className="sidebar" onClick={(e) => e.stopPropagation()}>
        <IconButton label="Invite Friends" onClick={handleInvite}>📋</IconButton>

        <IconButton
          label="Room Info"
          onClick={() => togglePanel("details")}
        >
          ℹ️
        </IconButton>

        <button
          className="icon-btn"
          onClick={() => togglePanel("participants")}
        >
          👥
          {participants.length > 0 && (
            <div className="icon-badge">{participants.length}</div>
          )}
          <span>Participants</span>
        </button>

        <IconButton label="Chat" onClick={() => togglePanel("chat")}>
          💬
        </IconButton>

        <IconButton  label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"} onClick={toggleFullscreen}>
          {isFullscreen ? "🗗" : "⛶"}
        </IconButton>

        <IconButton label="Leave Room" danger onClick={handleLeave}>
          🚪
        </IconButton>
      </div>

      {activePanel === "details" && room && (
        <div className="side-panel">
          <RoomDetails
            room={room}
            onClose={() => setActivePanel(null)}
            participantCount={participants.length}
          />
        </div>
      )}

      {activePanel === "participants" && (
        <div className="side-panel">
          <Participants
            roomId={roomId!}
            onClose={() => setActivePanel(null)}
          />
        </div>
      )}

      {activePanel === "chat" && (
        <div className="side-panel">
          <Chat roomId={roomId!} onClose={() => setActivePanel(null)} />
        </div>
      )}
    </div>
    </div>
  );
}

export default Room;