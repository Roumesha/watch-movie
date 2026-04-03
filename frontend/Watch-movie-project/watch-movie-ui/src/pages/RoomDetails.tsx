import type { RoomType } from "./types";
import { useToast } from "./useToast";
import "./RoomDetails.css"

type RoomDetailsProps = {
  room: RoomType;
  onClose: () => void;
  participantCount:number;
};
const RoomDetails=({room,onClose,participantCount}:RoomDetailsProps)=>{
     const { showToast } = useToast();

  const copyCode = () => {
    navigator.clipboard.writeText(room.roomCode);
    showToast("Room code copied 📋", "success")
  };

  return (
    <div className="room-overlay">
      <div className="room-panel">

        <div className="room-header">
          <h4>Room Details</h4>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="room-content">

          <div className="info-block">
            <label>ID</label>
            <span>{room.id}</span>
          </div>

          <div className="info-block">
            <label>Name</label>
            <span>{room.roomName}</span>
          </div>

          <div className="info-block code-block">
            <label>Room Code</label>
            {/* <div className="code-container"> */}
              <span>{room.roomCode}</span>
              <button onClick={copyCode} className="copy-btn">📋</button>
            {/* </div> */}
          </div>

          <div className="info-block">
            <label>Host</label>
            <span>{room.host?.name || "Host"}</span>
          </div>

          <div className="">
            👥 {participantCount} Participants
          </div>

        </div>
      </div>
    </div>
  );
};

export default RoomDetails;