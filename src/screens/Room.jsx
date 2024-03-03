import React, { useEffect, useCallback, useState, useRef } from "react";
import ReactPlayer from "react-player";
import peer from "../service/peer";
import { useSocket } from "../context/SocketProvider";
import { useSelector } from "react-redux";
import { AiOutlineAudio, AiOutlineAudioMuted } from "react-icons/ai";

const RoomPage = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();

  const [clientAudio, setClientAudio] = useState(true);
  const [userAudio, setUserAudio] = useState(true);

  const [isClientVideoVisible, setIsClientVideoVisible] = useState(true);
  const [userVideoVisible, setUserVideoVisible] = useState(true);

  const state = useSelector((state) => state);

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email ${email} joined room`);
    setRemoteSocketId(id);
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);
  }, [remoteSocketId, socket]);

  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      console.log(`Incoming Call`, from, offer);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer.setLocalDescription(ans);
      console.log("Call Accepted!");
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;

      setRemoteStream(remoteStream[0]);
    });
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
  ]);

  return (
    <div className="bg-black text-white h-full">
      <h1 className="text-center text-7xl">Room Page</h1>
      <h4 className="text-center mt-3">
        {remoteSocketId
          ? "Line has been connected successfully"
          : "No one in room"}
      </h4>
      <div className="flex justify-center mt-5 space-x-5">
        {myStream && (
          <button
            className="bg-red-600 px-5 py-1 rounded-sm hover:bg-white hover:text-black"
            onClick={sendStreams}
          >
            Send Stream
          </button>
        )}

        {remoteSocketId && (
          <button
            onClick={handleCallUser}
            className="bg-red-600 px-5 py-1 rounded-sm hover:bg-white hover:text-black"
          >
            Connect Call
          </button>
        )}
      </div>

      <div className="sm:flex sm:justify-between px-10 ">
        <div className="mb-5 sm:mb-0">
          {myStream && (
            <>
              <h1>My Stream : {state.userDetails.email}</h1>
              <ReactPlayer
                style={{
                  border: "1px solid green",
                  display: `${userVideoVisible ? "" : "none"}`,
                }}
                playing
                height="500px"
                width="500px"
                url={myStream}
                muted={userAudio}
              />

              {!userVideoVisible && (
                <div className="w-[500px] h-[500px] bg-blue-400 grid place-items-center">
                  <h3 className="bg-red-500 w-[70px] h-[70px] rounded-full grid place-items-center text-2xl capitalize">
                    {state.userDetails.email.split("")[0]}
                  </h3>
                </div>
              )}

              {/* <button onClick={()=> setUserAudio(!userAudio)}>{userAudio ? "Unmute" : "Mute"}</button> */}
              <div className="flex space-x-3">
                {/* @Audio Controls */}
                <div className="mt-3" onClick={() => setUserAudio(!userAudio)}>
                  {userAudio ? (
                    <AiOutlineAudioMuted
                      size={30}
                      color="black"
                      className="bg-white rounded-full"
                    />
                  ) : (
                    <AiOutlineAudio
                      size={30}
                      color="black"
                      className="bg-white rounded-full"
                    />
                  )}
                </div>

                {/* @Video Controls */}
                <div className="mt-3">
                  <button
                    onClick={() => setUserVideoVisible(!userVideoVisible)}
                  >
                    {userVideoVisible ? "Stop Video" : "Show Video"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <div>
          {remoteStream && (
            <>
              <h1>Remote Stream : {state.userDetails.email}</h1>
              <ReactPlayer
                style={{
                  border: "1px solid green",
                  display: `${isClientVideoVisible ? "" : "none"}`,
                }}
                playing
                height="500px"
                width="500px"
                url={remoteStream}
                muted={clientAudio}
              />

              {!isClientVideoVisible && (
                <div className="w-[500px] h-[500px] bg-blue-400 grid place-items-center">
                  <h3 className="bg-red-500 w-[70px] h-[70px] rounded-full grid place-items-center text-2xl capitalize">
                    {state.userDetails.email.split("")[0]}
                  </h3>
                </div>
              )}
              {/* <button onClick={()=> setClientAudio(!clientAudio)}>{clientAudio ? "Unmute" : "Mute"}</button> */}

              {/* ## Options Section ## */}
              <div className="flex space-x-5">
                <div
                  className="mt-3"
                  onClick={() => setClientAudio(!clientAudio)}
                >
                  {clientAudio ? (
                    <AiOutlineAudioMuted
                      size={30}
                      color="black"
                      className="bg-white rounded-full"
                    />
                  ) : (
                    <AiOutlineAudio
                      size={30}
                      color="black"
                      className="bg-white rounded-full"
                    />
                  )}
                </div>

                <div className="mt-3">
                  <button
                    onClick={() =>
                      setIsClientVideoVisible(!isClientVideoVisible)
                    }
                  >
                    {isClientVideoVisible ? "Stop Video" : "Show Video"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <h6 className="text-center text-red-700 text-2xl mt-5">
        Note: This is under development, build block by Ansh Viyogi
      </h6>
    </div>
  );
};

export default RoomPage;
