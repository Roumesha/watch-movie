import { useState } from "react";
import API from "../api/axio";
import { useToast } from "./useToast";
import { useNavigate } from "react-router-dom";
function Register(){
 const [username,setUserName]=useState("");
 const [email,setEmail]=useState("");
 const [password,setPassword]=useState("");
 const [message,setMessage]=useState("");
 const navigate=useNavigate();
 const {showToast}=useToast();

 const handleRegister=async()=>{
  if (!username || !email || !password) {
      setMessage("All fields are required");
      return;
    } 
    try{
        await API.post("/user/register",{
            username,
            email,
            password
        });
        localStorage.setItem("registerSuccess","true");
         navigate("/login");
    }
    catch(error){
        showToast("Registration Failed", "error");
        console.log(error)
      }
 }

 return(
   <div className="container vh-100 d-flex justify-content-center align-items-center">
      <div className="card p-4 shadow" style={{ width: "380px" }}>
        <h3 className="text-center mb-3">Register</h3>

        <input
          type="text"
          className="form-control mb-3"
          placeholder="Username"
          onChange={(e) => setUserName(e.target.value)}
        />

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

        {message && (
          <p className="text-danger text-center">{message}</p>
        )}

        <button className="btn btn-success w-100" onClick={handleRegister}>
          Register
        </button>
    </div>
    </div>
 )
}
export default Register;