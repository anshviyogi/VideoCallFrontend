import { Routes, Route } from "react-router-dom";
import "./App.css";
import LobbyScreen from "./screens/Lobby";
import RoomPage from "./screens/Room";
import Home from "./screens/Home";

function App() {
  return (
    <div className="">
      <Routes>
        <Route path="/" element={<Home />} />

        {/* <Route path="/" element={<LobbyScreen />} /> */}
        <Route path="/room/:roomId" element={<RoomPage />} />
      </Routes>
    </div>
  );
}

export default App;
