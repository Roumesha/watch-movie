import { useState } from "react";
import axio from "../api/axio";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {  getUserId } from "../pages/session";
import { useToast } from "./useToast";

const JoinRoom = () => {
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const { showToast } = useToast();

  const navigate = useNavigate();

  
  const handleJoin = async () => {
    if (!roomCode.trim()) {
      setError("Room code is required");
      return;
    }
    if (!name.trim()) {
  setError("Name is required");
  return;
}

   
    const userId = getUserId();
    
    localStorage.setItem("userId", userId);
    localStorage.setItem("displayName", name);

    try{
      
      const response = await axio.post("/rooms/join", {
        roomCode,
        
        userId,
        displayName:name
        
      });
      showToast(`Joined room as ${name} 🎬`, "success");
      navigate(`/room/${response.data.roomId}`,{state:response.data});
    }catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if(error.response?.status === 409) {
       setError( "You are already in this room "
       )
       return;
      } 
    setError(
  typeof error.response?.data === "string"
    ? error.response.data
    : error.response?.data?.message || "Invalid room code"
);
}

    
   else{
    setError("Something went wrong");
  }
}
  }
  return (
    <div className="container vh-100 d-flex align-items-center justify-content-center">
      <div className="card shadow p-4" style={{ width: "380px" }}>
        <h3 className="text-center mb-3">Join a Room 🎬</h3>

        {error && <div className="alert alert-danger">{error}</div>}

        <input
          type="text"
          className="form-control mb-3"
          placeholder="Enter room code"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
        />
        <input
  type="text"
  className="form-control mb-3"
  placeholder="Enter your name"
  value={name}
  onChange={(e) => setName(e.target.value)}
/>


        <button className="btn btn-primary w-100" onClick={handleJoin}>
          Join Room
        </button>
      </div>
    </div>
  );
};

export default JoinRoom;
