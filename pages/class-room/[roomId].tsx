import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Layout from "../../components/Layout";
import ProtectedRoute from "../../components/ProtectedRoute";
import { io, Socket } from "socket.io-client";
import SimplePeer from "simple-peer";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaDesktop,
  FaPhone,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

export default function ClassRoom() {
  const router = useRouter();
  const { roomId } = router.query;
  const { user } = useAuth();

  const [socket, setSocket] = useState<Socket | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [peers, setPeers] = useState<{ [key: string]: any }>({});
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  const [classInfo, setClassInfo] = useState<any>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideosRef = useRef<{ [key: string]: HTMLVideoElement }>({});
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const peersRef = useRef<{ [key: string]: any }>({});

  useEffect(() => {
    if (!roomId) return;

    initializeMedia();
    initializeSocket();

    return () => {
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setLocalStream(stream);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing media devices:", error);
      alert("Please allow camera and microphone access");
    }
  };

  const initializeSocket = () => {
    // NOTE: WebSocket signaling requires a separate server on Vercel.
    // Set NEXT_PUBLIC_SOCKET_URL in .env.local to point to your signaling server.
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
    const newSocket = io(socketUrl);
    setSocket(newSocket);

    newSocket.emit("join-room", {
      roomId,
      userId: user?.id,
      userName: user?.name,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    newSocket.on("existing-users", (users: any[]) => {
      users.forEach((existingUser) => {
        createPeer(existingUser.socketId, true);
      });
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    newSocket.on("user-connected", ({ userId, userName }) => {
      console.log("User connected:", userName);
    });

    newSocket.on("signal", ({ from, signal }) => {
      if (peersRef.current[from]) {
        peersRef.current[from].signal(signal);
      } else {
        createPeer(from, false, signal);
      }
    });

    newSocket.on("user-disconnected", (userId) => {
      if (peersRef.current[userId]) {
        peersRef.current[userId].destroy();
        delete peersRef.current[userId];
        setPeers({ ...peersRef.current });
      }
    });
  };

  const createPeer = (
    peerId: string,
    initiator: boolean,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    incomingSignal?: any,
  ) => {
    if (!localStream || !socket) return;

    const peer = new SimplePeer({
      initiator,
      trickle: false,
      stream: localStream,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    peer.on("signal", (signal: any) => {
      socket.emit("signal", {
        to: peerId,
        signal,
        from: socket.id,
      });
    });

    peer.on("stream", (stream: MediaStream) => {
      if (remoteVideosRef.current[peerId]) {
        remoteVideosRef.current[peerId].srcObject = stream;
      }
    });

    peer.on("error", (err: Error) => {
      console.error("Peer error:", err);
    });

    if (incomingSignal) {
      peer.signal(incomingSignal);
    }

    peersRef.current[peerId] = peer;
    setPeers({ ...peersRef.current });
  };

  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks()[0].enabled = isAudioMuted;
      setIsAudioMuted(!isAudioMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks()[0].enabled = isVideoOff;
      setIsVideoOff(!isVideoOff);
    }
  };

  const startScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

      const screenTrack = screenStream.getVideoTracks()[0];

      // Replace video track in all peer connections
      Object.values(peersRef.current).forEach((peer) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sender = (peer as any)._pc
          .getSenders()
          .find((s: RTCRtpSender) => s.track?.kind === "video");
        if (sender) {
          sender.replaceTrack(screenTrack);
        }
      });

      setIsScreenSharing(true);

      screenTrack.onended = () => {
        stopScreenShare();
      };

      if (socket) {
        socket.emit("screen-share-start", { roomId });
      }
    } catch (error) {
      console.error("Error sharing screen:", error);
    }
  };

  const stopScreenShare = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];

      // Restore original video track
      Object.values(peersRef.current).forEach((peer) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sender = (peer as any)._pc
          .getSenders()
          .find((s: RTCRtpSender) => s.track?.kind === "video");
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
      });

      setIsScreenSharing(false);

      if (socket) {
        socket.emit("screen-share-stop", { roomId });
      }
    }
  };

  const leaveClass = () => {
    cleanup();
    router.push("/classes");
  };

  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }

    Object.values(peersRef.current).forEach((peer) => {
      peer.destroy();
    });

    if (socket) {
      socket.disconnect();
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <Head>
          <title>Class Room - Quran Learning Platform</title>
        </Head>

        <div className="min-h-screen bg-slate-100 dark:bg-dark-bg py-8 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Video Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              {/* Local Video */}
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                  You {isScreenSharing && "(Sharing Screen)"}
                </div>
              </div>

              {/* Remote Videos */}
              {Object.keys(peers).map((peerId) => (
                <div
                  key={peerId}
                  className="relative bg-black rounded-lg overflow-hidden aspect-video"
                >
                  <video
                    ref={(el) => {
                      if (el) remoteVideosRef.current[peerId] = el;
                    }}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                    Participant
                  </div>
                </div>
              ))}
            </div>

            {/* Controls */}
            <div className="bg-white dark:bg-dark-card rounded-lg shadow-xl border border-slate-100 dark:border-dark-border p-6">
              <div className="flex justify-center space-x-4">
                <button
                  onClick={toggleAudio}
                  className={`p-4 rounded-full transition-all duration-300 ${
                    isAudioMuted
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700"
                  } text-white`}
                  title={isAudioMuted ? "Unmute" : "Mute"}
                >
                  {isAudioMuted ? (
                    <FaMicrophoneSlash size={24} />
                  ) : (
                    <FaMicrophone size={24} />
                  )}
                </button>

                <button
                  onClick={toggleVideo}
                  className={`p-4 rounded-full transition-all duration-300 ${
                    isVideoOff
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700"
                  } text-white`}
                  title={isVideoOff ? "Turn On Video" : "Turn Off Video"}
                >
                  {isVideoOff ? (
                    <FaVideoSlash size={24} />
                  ) : (
                    <FaVideo size={24} />
                  )}
                </button>

                <button
                  onClick={isScreenSharing ? stopScreenShare : startScreenShare}
                  className={`p-4 rounded-full transition-all duration-300 ${
                    isScreenSharing
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700"
                  } text-white`}
                  title={isScreenSharing ? "Stop Sharing" : "Share Screen"}
                >
                  <FaDesktop size={24} />
                </button>

                <button
                  onClick={leaveClass}
                  className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all duration-300"
                  title="Leave Class"
                >
                  <FaPhone size={24} className="transform rotate-135" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
