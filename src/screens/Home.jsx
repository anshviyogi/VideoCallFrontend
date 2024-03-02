import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import { useNavigate } from "react-router-dom";

function Home() {
  var currentTime = new Date();

  var hours = currentTime.getHours();
  var minutes = currentTime.getMinutes();

  const [email, setEmail] = useState(null)
  const [room, setRoom] = useState(null)
  const socket = useSocket();
  const navigate = useNavigate();

  const formSubmitHandler = useCallback((e)=> {
    e.preventDefault()
    socket.emit("room:join", { email, room });
  },[email,room])

  const handleJoinRoom = useCallback(
    (data) => {
      const { room } = data;
      navigate(`/room/${room}`);
    },
    [navigate]
  );

  useEffect(() => {
    socket.on("room:join", handleJoinRoom);
    return () => {
      socket.off("room:join", handleJoinRoom);
    };
  }, [socket, handleJoinRoom]);

  return (
    <>
      <div className="flex justify-between px-10 py-2">
        <div className="flex cursor-pointer">
          <img src="https://www.gstatic.com/meet/google_meet_horizontal_wordmark_2020q4_1x_icon_124_40_2373e79660dabbf194273d27aa7ee1f5.png" />
          <h4 className="ml-2 text-xl mt-1 text-gray-500 hover:underline">
            Meet Ansh
          </h4>
        </div>

        <div className="flex space-x-10">
          <h3 className="mt-2 text-l">{`${hours}:${minutes}`}PM</h3>
          <div className="w-10 h-10 bg-gray-400 rounded-full flex justify-center align-middle">
            <span className="flex justify-center align-middle">A</span>
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <div className="mt-28 px-24 py-2 flex justify-between">
        <div className="mt-10">
          <h1 className="text-4xl w-[70%] font-mono ">
            Video Calls and Meetings for Everyone
          </h1>
          <p className="text-l w-[70%] text-gray-500 mt-5">
            Meet Ansh provides, easy-to-use video calls and meetings for
            everyone, on any device.
          </p>

          <form className="mt-5 space-y-3" onSubmit={formSubmitHandler}>
            <input
              type="email"
              placeholder="john.karly@outlook.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="border border-gray-300 outline-none focus:border-gray-400 py-1 px-2 rounded-md w-[50%]"
            />
            <br />
            <input
              type="number"
              value={room}
              onChange={e => setRoom(e.target.value)}
              placeholder="Room ID"
              className="border border-gray-300 outline-none focus:border-gray-400 py-1 px-2 rounded-md w-[30%]"
            />
            <br />
            <button
              className="bg-blue-800 px-5 py-1 rounded-sm text-white disabled:bg-blue-200 disabled:cursor-not-allowed"
              disabled={room && email ? false : true}
            >
              Join
            </button>
          </form>
        </div>

        <div>
          <img
            className="rounded-md"
            src="https://imgs.search.brave.com/I0h0OLJsnHPsgK3Cruy7KOHRA0NQb00t0Uy0H-j1SoU/rs:fit:860:0:0/g:ce/aHR0cHM6Ly9pbWcu/ZnJlZXBpay5jb20v/ZnJlZS1waG90by9y/ZW1vdGUtbWVldGlu/Zy1tYW4td29ya2lu/Zy1mcm9tLWhvbWUt/ZHVyaW5nLWNvcm9u/YXZpcnVzLWNvdmlk/LTE5LXF1YXJhbnRp/bmUtcmVtb3RlLW9m/ZmljZS1jb25jZXB0/XzE1NTAwMy0xMjM1/Ny5qcGc_c2l6ZT02/MjYmZXh0PWpwZw"
          />
        </div>
      </div>
    </>
  );
}

export default Home;
