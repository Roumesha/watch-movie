import { useState } from "react";
import API from "../api/axio";
import { useNavigate } from "react-router-dom";
import { jwtDecode} from "jwt-decode";
import type { JwtPayload } from "./types";
import { useToast } from "./useToast";

function Login(){
    const [email,setEmail]=useState("");
    const [password,setPassword]=useState("");
    const [error,setError]=useState("");
    const navigate=useNavigate();
    const {showToast}=useToast();

    const handleLogin=async()=>{
      if (!email || !password) {
      setError("Please enter email and password");
      return;
    }
        try{
            const response=await API.post("/user/login",{
                email,
                password
            })
            const token=response.data;
            localStorage.setItem("token",token);
           const decoded: JwtPayload = jwtDecode(token);
    localStorage.setItem("userId", String(decoded.userId));
    localStorage.setItem("loginSuccess","true");
    localStorage.setItem("displayName",decoded.username)
            navigate("/"); 
        }
        catch(error){
            showToast("Invalid credentials","error");
            console.log(error)
            
        }
    }
    return (
    <div className="container vh-100 d-flex justify-content-center align-items-center">
      <div className="card p-4 shadow" style={{ width: "380px" }}>
        <h3 className="text-center mb-3">Login</h3>

        <input
          type="email"
          className="form-control mb-3"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="form-control mb-3"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p className="text-danger text-center">{error}</p>
        )}

        <button className="btn btn-primary w-100 mb-2" onClick={handleLogin}>
          Login
        </button>

        <button
          className="btn btn-outline-secondary w-100"
          onClick={() => navigate("/register")}
        >
          New user? Register
        </button>
      </div>
    </div>
  );
}
export default Login;