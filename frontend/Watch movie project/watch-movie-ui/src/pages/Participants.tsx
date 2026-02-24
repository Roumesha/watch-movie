import { useEffect, useState } from "react";
import type { RoomParticipant } from "./types";
import axio from "../api/axio";

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

    return(
        <div className="modal  d-block bg-dark  bg-opacity-50">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5>
                            Participants
                        </h5>
                        <button className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        {participants.map(p=>(
                            <div key={p.id} className="d-flex justify-content-between mb-2">
                                <span >{p.displayName}</span>
                                <span className="badge bg-secondary"> {p.role}</span>
                                </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Participants;