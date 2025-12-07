import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import { useParams, useNavigate } from 'react-router-dom';

const VideoRoom = () => {
    const { roomId } = useParams();
    const [stream, setStream] = useState();
    const [receivingCall, setReceivingCall] = useState(false);
    const [caller, setCaller] = useState("");
    const [callerSignal, setCallerSignal] = useState();
    const [callAccepted, setCallAccepted] = useState(false);
    const [idToCall, setIdToCall] = useState("");
    const [callEnded, setCallEnded] = useState(false);
    const [name, setName] = useState("");
    const navigate = useNavigate();

    const myVideo = useRef();
    const userVideo = useRef();
    const connectionRef = useRef();
    const socket = useRef();

    useEffect(() => {
        socket.current = io.connect('http://localhost:8000');

        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
            setStream(stream);
            if (myVideo.current) {
                myVideo.current.srcObject = stream;
            }
        });

        socket.current.emit("join_room", roomId);

        socket.current.on("user_joined", (data) => {
            console.log("User joined:", data);
            setIdToCall(data.sid); // In a real app, handle multiple users
        });

        socket.current.on("offer", (data) => {
            setReceivingCall(true);
            setCaller(data.caller);
            setCallerSignal(data.sdp);
        });
    }, [roomId]);

    const callUser = (id) => {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream: stream
        });

        peer.on("signal", (data) => {
            socket.current.emit("offer", {
                target: id,
                sdp: data
            });
        });

        peer.on("stream", (stream) => {
            if (userVideo.current) {
                userVideo.current.srcObject = stream;
            }
        });

        socket.current.on("answer", (data) => {
            setCallAccepted(true);
            peer.signal(data.sdp);
        });

        connectionRef.current = peer;
    };

    const answerCall = () => {
        setCallAccepted(true);
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream: stream
        });

        peer.on("signal", (data) => {
            socket.current.emit("answer", {
                target: caller,
                sdp: data
            });
        });

        peer.on("stream", (stream) => {
            if (userVideo.current) {
                userVideo.current.srcObject = stream;
            }
        });

        peer.signal(callerSignal);
        connectionRef.current = peer;
    };

    const leaveCall = () => {
        setCallEnded(true);
        if (connectionRef.current) {
            connectionRef.current.destroy();
        }
        navigate('/dashboard/appointments');
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
            <h1 className="text-3xl font-bold mb-8">Video Room: {roomId}</h1>
            <div className="flex flex-wrap justify-center gap-4">
                <div className="relative">
                    {stream && <video playsInline muted ref={myVideo} autoPlay className="w-[400px] rounded-lg border-2 border-blue-500" />}
                    <span className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded">You</span>
                </div>
                <div className="relative">
                    {callAccepted && !callEnded ? (
                        <video playsInline ref={userVideo} autoPlay className="w-[400px] rounded-lg border-2 border-green-500" />
                    ) : null}
                    {callAccepted && !callEnded && <span className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded">Remote</span>}
                </div>
            </div>

            <div className="mt-8 space-x-4">
                {receivingCall && !callAccepted ? (
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <p className="mb-2">Incoming Call...</p>
                        <button onClick={answerCall} className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded font-bold">
                            Answer
                        </button>
                    </div>
                ) : null}

                {idToCall && !callAccepted && !receivingCall ? (
                    <button onClick={() => callUser(idToCall)} className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded font-bold">
                        Call User
                    </button>
                ) : null}

                {callAccepted && !callEnded ? (
                    <button onClick={leaveCall} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded font-bold">
                        End Call
                    </button>
                ) : (
                    <button onClick={() => navigate('/dashboard/appointments')} className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded font-bold">
                        Leave Room
                    </button>
                )}
            </div>
        </div>
    );
};

export default VideoRoom;
