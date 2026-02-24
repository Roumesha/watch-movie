import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axio from "../api/axio";
import type { Movie } from "./types";

const CreateRoom=() =>{
  const[roomName,setRoomName]=useState("");
  const[movieId,setMovieId]=useState("");
  const[message,setMessage]=useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [uploading,setUploading]=useState(false);
  const nav=useNavigate();
  const userId=localStorage.getItem("userId")
  const [selectedFile, setSelectedFile] = useState<File | null>(null);


  const fetchMovies=async ()=>{
      try{
        const res=await axio.get<Movie[]>(`/movies/user/${userId}`)
        setMovies(res.data)
        if (res.data.length > 0) {
      setMovieId(String(res.data[res.data.length - 1].id));
        }
      }catch(err){
        console.log(err)
      }
    }
  useEffect(()=>{
    const token=localStorage.getItem("token"); 
    if(!token){
      nav("/login")
      return
    }

    
    fetchMovies();
  },[nav])
  const createRoom=async()=>{
     if (!movieId) {
      setMessage("Please select a movie");
      return;
    }
    try{
      const res=await axio.post('/rooms/create',
        {roomName,
          movieId: Number(movieId)});
        nav(`/room/${res.data.id}`,{state:res.data});
      
      setMessage(`Room created! Room Code: ${res.data.roomCode}`);
    }
    catch(error:unknown){
      if(axios.isAxiosError(error)){
        if (error.response?.status === 409) {
      setMessage("Room name already exists, please choose a different name");
      return; 
    }
        setMessage(
      typeof error.response?.data === "string"
        ? error.response.data
        : error.response?.data?.message || "Failed to create room"
    );
      }
      else{
        setMessage("Unexpected error occured");
      }
    }
  }

  const handleUpload=async()=>{
    if(!selectedFile){
      setMessage("Please select a movie file");
      return;
    }
    const formData=new FormData();
    formData.append("movie",selectedFile);
    formData.append("userId",userId as string);
    try{
      setUploading(true);
      await axio.post("/movies/upload",formData,{
        headers:{"Content-Type":"multipart/form-data"}
      })
      setMessage("Movie uploaded successfully");
      setSelectedFile(null);
      await fetchMovies();
    }
    catch (error) {
      if (axios.isAxiosError(error)) {
  setMessage(error.response?.data || "Upload failed");
} else {
  setMessage("Upload failed");
}
    } finally {
      setUploading(false);
    }

  }

  return (
    <div className="container vh-100 d-flex align-items-center justify-content-center">
      <div className="card shadow p-4" style={{ width: "380px" }}>
        <h3 className="text-center mb-3">Create a Room</h3>

        <input
          type="text"
          className="form-control mb-3"
          placeholder="Room Name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
        />

        {movies.length>0?(
          <>
          <select 
        className="form-control mb-3"
        value={movieId}
        onChange={e=>setMovieId(e.target.value)}>
          <option value="">Select a movie</option>
          {movies.map((movie)=>(
            <option key={movie.id} value={movie.id}>{movie.title}</option>
          ))}
        </select>
          </>
        ):(
          <>
          <p className="text-danger text-center">
              No movies found. Upload one to continue.
            </p>

            <input
              type="file"
              className="form-control mb-2"
              accept="video/mp4"
              onChange={(e) =>
                setSelectedFile(e.target.files ? e.target.files[0] : null)
              }
            />
            <button
              className="btn btn-secondary w-100 mb-3"
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload Movie"}
            </button>
          </>
        )}
        
        

        <button className="btn btn-primary w-100" onClick={createRoom}>
          Create Room
        </button>
        {message && (
          <p className="text-center mt-3 fw-bold">{message}</p>
        )}
      </div>
    </div>
  );
}

export default CreateRoom;
