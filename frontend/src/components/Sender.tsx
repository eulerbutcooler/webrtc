import { useEffect, useState, useRef } from "react";

export function Sender() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [pc, setPC] = useState<RTCPeerConnection | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "sender" }));
    };
    setSocket(socket);
  }, []);

  async function startVideo() {
    if (!socket) return;
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    setPC(pc);

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    pc.onnegotiationneeded = async () => {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket?.send(
        JSON.stringify({ type: "create-offer", sdp: pc.localDescription })
      );
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket?.send(
          JSON.stringify({ type: "iceCandidate", candidate: event.candidate })
        );
      }
    };

    socket.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "answer") {
        await pc.setRemoteDescription(data.sdp);
      } else if (data.type === "iceCandidate") {
        await pc.addIceCandidate(data.candidate);
      }
    };

    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }

  return (
    <div>
      <h2>Sender</h2>
      <button onClick={startVideo}>Start video</button>
      <br />
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{
          width: "400px",
          height: "300px",
          background: "black",
          marginTop: "10px",
        }}
      />
    </div>
  );
}
