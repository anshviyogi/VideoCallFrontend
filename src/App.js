import { Routes, Route } from "react-router-dom";
import LobbyScreen from "./screens/Lobby";
import RoomPage from "./screens/Room";
import Home from "./screens/Home";
import Chat from "./screens/Chat";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/room/:roomId" element={<RoomPage />} />

        {/* <Route path="/" element={<LobbyScreen />} /> */}

      </Routes>
    </div>
  );
}

export default App;
