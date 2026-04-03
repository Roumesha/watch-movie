
import { Routes ,Route} from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import JoinRoom from './pages/JoinRoom'
import CreateRoom from './pages/CreateRoom'
import Room from './pages/Room'
import Login from "./pages/Login";
import Register from "./pages/Register";


function App() {
  

  return (
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/join" element={<JoinRoom />} />
      <Route path="/create" element={<CreateRoom />} />
      <Route path="/room/:roomId" element={<Room/>} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

    </Routes>
  )
}

export default App;
