import { useEffect, useState, useRef } from "react";

export function Receiver() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<string>("Not connected");
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    let peerConnection: RTCPeerConnection | null = null;

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "receiver" }));
    };

    socket.onmessage = async (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.type === "offer") {
          peerConnection = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
          });

          peerConnection.onconnectionstatechange = () => {
            setConnectionStatus(peerConnection?.connectionState || "unknown");
          };

          peerConnection.ontrack = (event) => {
            if (videoRef.current && event.streams[0]) {
              videoRef.current.srcObject = event.streams[0];
            }
          };

          peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
              socket.send(
                JSON.stringify({
                  type: "iceCandidate",
                  candidate: event.candidate,
                })
              );
            }
          };

          await peerConnection.setRemoteDescription(message.sdp);
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);

          socket.send(
            JSON.stringify({
              type: "create-answer",
              sdp: peerConnection.localDescription,
            })
          );
        } else if (message.type === "iceCandidate") {
          if (peerConnection) {
            await peerConnection.addIceCandidate(message.candidate);
          }
        }
      } catch (error) {
        console.log("Error:", error);
      }
    };

    setSocket(socket);

    return () => {
      if (peerConnection) {
        peerConnection.close();
      }
      socket.close();
    };
  }, []);

  return (
    <div>
      <h2>Receiver</h2>
      <p>Connection Status: {connectionStatus}</p>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ width: "400px", height: "300px", background: "black" }}
      />
    </div>
  );
}
