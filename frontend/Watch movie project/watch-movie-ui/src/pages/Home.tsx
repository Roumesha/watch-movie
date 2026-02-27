
import { Link, useNavigate } from "react-router-dom";

import { useEffect,useState } from "react";
import { useToast } from "./useToast";
function Home(){
    const navigate=useNavigate();
    const [showProfile,setShowProfile]=useState(false);
     const token = localStorage.getItem("token");
     const { showToast } = useToast();

     const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  useEffect(() => {
  const loginSuccess = localStorage.getItem("loginSuccess");
  if (loginSuccess) {
    showToast(
      "Welcome Back, " + (localStorage.getItem("displayName") || "User") + "!",
      "success"
    );
    localStorage.removeItem("loginSuccess");
  }

  const registerSuccess = localStorage.getItem("registerSuccess");
  if (registerSuccess) {
    showToast("Registered Successfully!!!", "success");
    localStorage.removeItem("registerSuccess");
  }

  const logoutSuccess = localStorage.getItem("logoutSuccess");
  if (logoutSuccess) {
    showToast("Logged Out Successfully!", "info");
    localStorage.removeItem("logoutSuccess");
  }
}, []);

 
    return(
        <div className="d-flex flex-column min-vh-100">
            <div
        className="d-flex justify-content-between align-items-center p-3 bg-dark shadow-sm "
      >
        <h3>🎬 Watch Party</h3>

        <div>
          {!token ? (
            <>
              <Link to="/login" className="btn btn-outline-primary me-2">Login</Link>
              <Link to="/register" className="btn btn-primary">Register</Link>
            </>
          ) : (
            <div className="d-flex align-items-center">
              <div className="me-3 position-relative"
                onMouseEnter={() => setShowProfile(true)}
                onMouseLeave={() => setShowProfile(false)}>
                <img
                src="/userProfile.jpg"
                alt="Profile"
                          className="rounded-circle"
          style={{ width: "40px", height: "40px", cursor: "pointer" }} />
          {showProfile && (
    <div className="profile-popup shadow">
      <div className="fw-semibold">
        {localStorage.getItem("displayName") || "User"}
      </div>
      <small className="text-muted">
        {localStorage.getItem("email") || ""}
      </small>
    </div>
  )}
                </div>
            <button  className="btn btn-danger" onClick={handleLogout}>Logout</button>
            </div>
            
          )}
        </div>
        </div>

        
        <div className="container d-flex justify-content-center align-items-center flex-grow-1">
      <div className="card shadow p-4 text-center" style={{ width: "350px" }}>
        <h3 className="mb-4">🎬 Watch Movie Together</h3>
        <button
        className="btn btn-primary w-100 mb-3"
        onClick={()=>navigate("/join")}
        >Join Room</button>
        <button className="btn btn-outline-primary w-100 mb-3"
        onClick={()=>navigate("/create")}
        >Create Room</button>
        </div>
        </div>
        </div>
    )
}
export default Home;