import type { RoomType } from "./types";


type RoomDetailsProps = {
  room: RoomType;
  onClose: () => void;
  participantCount:number;
};
const RoomDetails=({room,onClose,participantCount}:RoomDetailsProps)=>{
    const copyCode=()=>{
        navigator.clipboard.writeText(room.roomCode)
        .then(()=>
        alert("Room code copied!"));
    }
    return(
        <div className="modal  d-block bg-dark bg-opacity-50">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5>Room  Details</h5>
                        <button  className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <p><b>ID:</b>{room.id}</p>
                        <p><b>Name:</b>{room.roomName}</p>
                        <p><b>Room Code:</b>{room.roomCode}
                        <button className="btn btn-sm btn-outline-secondary ms-2" onClick={copyCode}> 📋</button>
                        </p>
                        <p><b>Host:</b> {room.host?.name ||"Host"}</p>
                        <p><b>Participants:</b>{participantCount}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default RoomDetails;