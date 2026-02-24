// import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
// import { connectSocket } from "../api/socket";
import "../pages/Room.css";
import RoomDetails from "./RoomDetails";
import Participants from "./Participants";
import Chat from "./Chat";
import type  { RoomData,RoomParticipant ,RoomType,SyncMessage} from "./types";
import axio from "../api/axio";
import IconButton from "./IconButton";
import {Client} from "@stomp/stompjs";
import SockJS from "sockjs-client";
import {useRef} from "react";



function Room(){
  const {roomId}=useParams();
  const {state}=useLocation()as { state: RoomType };
  const navigate=useNavigate();
  const [showDetails,setShowDetails]=useState(false);
  const [showParticipants, setShowParticipants]=useState(false);
  const [showChat,setShowChat]=useState(false);
  const [participants, setParticipants] = useState<RoomParticipant[]>([]);
  const [isSyncing,setIsSyncing]=useState(false);
  const room: RoomType = state;
  const videoRef=useRef<HTMLVideoElement>(null);
  const clientRef=useRef<Client|null>(null);
 const [rooms, setRooms] = useState<RoomData | null>(null);
 const [hasInteracted, setHasInteracted]=useState(false);


const handleSync=(data:SyncMessage)=>{
  console.log("SYNC RECEIVED:", data);
    if(!videoRef.current) return ;
    setIsSyncing(true);
    const video=videoRef.current;
    const timeDiff=Math.abs(video.currentTime-data.time);
     
    if(timeDiff>0.5){
      video.currentTime=data.time;
    }
    if (data.playing) {
  
    video.play().catch((error) => {
      console.log("Autoplay blocked:", error);
    });
  
} else {
  video.pause();
}
    setTimeout(()=>setIsSyncing(false),500)
  }
  


  useEffect(()=>{
    if(!roomId ) return;
    axio.get(`/rooms/getRoom/${roomId}`)
    .then(res=>setRooms(res.data));

    axio.get(`/rooms/${roomId}/participants`)
    .then(res=>setParticipants(res.data));
  },[roomId])

  const isHost=()=>{
    const userId=localStorage.getItem("userId");
    console.log("Host check:", userId, rooms?.host?.id);
    if (!userId || !rooms?.host?.id) return false;
    return  String(rooms?.host?.id)===String(userId);
  }

  useEffect(()=>{
    if(!roomId ||!rooms) return;
    const client=new Client({
      webSocketFactory:()=>new SockJS("http://localhost:8080/ws"),
        reconnectDelay:5000,
        onConnect:(frame)=>{
          console.log("Connected to websocket");
          client.subscribe(`/topic/room/${room.roomCode}`,(message)=>{
            const data:SyncMessage=JSON.parse(message.body);
            handleSync(data);
          })

          const userId = localStorage.getItem("userId");
if (!userId) {
  console.error("No userId found in localStorage");
  return;
}

          const sessionId=frame.headers['session'];
          localStorage.setItem("sessionId",sessionId);
          //JOIN room
          client.publish({
            destination:`/app/room/${room.roomCode}/join`,
            body:JSON.stringify({
              userId:userId,
              role:isHost()?"HOST":"VIEWER"
            })
          })
          //particiapnt update
          client.subscribe(
            `/topic/participants/${room.roomCode}`,
            (message)=>{
              const updatedList=JSON.parse(message.body);
              setParticipants(updatedList);
            }
          )

          // REQUEST SYNC
          client.publish({
            destination:`/app/room/${room.roomCode}/sync-request`,
            body:""
          })
        }
    })
    client.activate();
    clientRef.current=client;
    return ()=>{
      client.deactivate();
    }
  },[roomId,rooms])


  if(!rooms) return null;
  
  const sendControl=(playing:boolean)=>{
    if(!videoRef.current || !clientRef.current){
      console.log("CLIENT NOT READY")
      return;
    } 
    console.log("Client connected:", clientRef.current.connected);
    if (!clientRef.current.connected) {
    console.log("STOMP NOT CONNECTED YET");
    return;
  }
    console.log("SENDING CONTROL:", {
    playing,
    time: videoRef.current.currentTime
  });
    clientRef.current.publish({
      destination:`/app/room/${room.roomCode}/control`,
      body:JSON.stringify({
        playing:playing,
        time:videoRef.current.currentTime
      })
    })
  }
  

  // console.log("ROOM STATE:", rooms);
  if (!rooms || !rooms.movie.id) return null;

  const handleLeave=async()=>{
    try{
      if (clientRef.current) {
      await clientRef.current.deactivate();
    }
      
      await axio.delete("/rooms/leave",{  
        params:{
          roomId:roomId,
          sessionId:localStorage.getItem("sessionId")
        }
      })
    }catch (err) {
      console.log("Leave failed", err);
    }
    finally{
      navigate("/");
    }
  }
  


  return(
    <div className="vh-100 position-relative bg-black">
      {!hasInteracted && (
  <div 
    className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark"
    style={{ zIndex: 10,
      
     }}
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
      controls={isHost()}
      preload="auto"
      src={`http://localhost:8080/movies/stream/${rooms?.movie.id}`}
      onPlay={() => {
  console.log("PLAY EVENT FIRED");
  if(!isHost()) return;
  if(isSyncing) return ;
    sendControl(true);
  
}}
      onPause={()=>{
        console.log("PAUSE EVENT FIRED");
         if (!isHost()) return;      
  if (isSyncing) return;
        
          sendControl(false)
        }}

      onSeeked={() => {
  console.log("SEEK EVENT FIRED");
        if (!isHost()) return;      
  if (isSyncing) return;      
  if (!videoRef.current) return;
  
    sendControl(!videoRef.current.paused);
  
}} />
    
    <div className="controls">
      <IconButton label="Room Info" onClick={() => setShowDetails(true)}>ℹ️</IconButton>
        <IconButton label="Participants" onClick={() => setShowParticipants(true)}>👥</IconButton>
        <IconButton label="Chat" onClick={() => setShowChat(true)}>💬</IconButton>
        <IconButton label="Leave Room" danger onClick={() => handleLeave()}>🚪</IconButton>
    </div>
    {showDetails && (
    <RoomDetails room={room} 
    onClose={()=>setShowDetails(false)}
    participantCount={participants.length}
    />
    )}
    {showParticipants && <Participants roomId={roomId!} onClose={()=>setShowParticipants(false)}/>}
      {showChat && <Chat roomId={roomId!} onClose={()=>setShowChat(false)}/>}

    </div>
  )
  
}
export default Room;