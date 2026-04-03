type ChatProps = {
  roomId: string;
  onClose: () => void;
};

const Chat=({onClose}:ChatProps)=>{
    return(
         <div className="modal d-block bg-dark bg-opacity-50">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5>Room Chat: </h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <p>Chat messages will appear here…</p>
            <input className="form-control" placeholder="Type a message..." />
          </div>
        </div>
      </div>
    </div>
    )
}
export default Chat;