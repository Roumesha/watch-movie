import { Link, useNavigate } from "react-router-dom";

function Home(){
    const navigate=useNavigate();
     const token = localStorage.getItem("token");
     const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
    return(
        <div>
            <div
        className="d-flex justify-content-between align-items-center p-3 bg-light shadow-sm"
      >
        <h3>🎬 Watch Party</h3>

        <div>
          {!token ? (
            <>
              <Link to="/login" className="btn btn-outline-primary me-2">Login</Link>
              <Link to="/register" className="btn btn-primary">Register</Link>
            </>
          ) : (
            <button  className="btn btn-danger" onClick={handleLogout}>Logout</button>
          )}
        </div>
        </div>

        
        <div className="container d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
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