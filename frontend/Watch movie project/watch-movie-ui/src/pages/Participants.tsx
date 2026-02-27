import { useEffect, useState } from "react";
import type { RoomParticipant } from "./types";
import axio from "../api/axio";
import "./Participants.css"

type ParticipantsProps = {
  roomId: string;
  onClose: () => void;
};

const Participants=({roomId,onClose}:ParticipantsProps)=>{
    const [participants,setParticipants]=useState<RoomParticipant[]>([]);

   useEffect(() => {
  if (!roomId) return;

  axio
    .get(`/rooms/${roomId}/participants`)
    .then(res => setParticipants(res.data))
    .catch(err => console.error(err));

}, [roomId]);

    return (
  <div className="participants-overlay">
    <div className="participants-panel">

      <div className="participants-header">
        <h4>👥 Participants</h4>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="participants-body">
        {participants.map((p) => (
          <div key={p.id} className="participant-row">

            <div className="participant-left">
              <div className="avatar">
                {p.displayName.charAt(0).toUpperCase()}
              </div>
              <span className="name">{p.displayName}</span>
            </div>

            <span className={`role-badge ${p.role.toLowerCase()}`}>
              {p.role}
            </span>

          </div>
        ))}
      </div>

    </div>
  </div>
);
}
export default Participants;