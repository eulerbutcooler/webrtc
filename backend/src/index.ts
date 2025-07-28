import { WebSocketServer } from "ws";
import type { WebSocket as WsWebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080 });

let senderSocket: null | WsWebSocket = null;
let receiverSocket: null | WsWebSocket = null;

wss.on("connection", function connection(ws) {
  ws.on("error", console.error);
  ws.on("message", function message(data: any) {
    const message = JSON.parse(data);
    console.log(JSON.stringify(message));
    if (message.type == "sender") {
      senderSocket = ws;
    } else if (message.type == "receiver") {
      receiverSocket = ws;
    } else if (message.type == "create-offer") {
      if (ws != senderSocket) {
        return;
      }
      receiverSocket?.send(JSON.stringify({ type: "offer", sdp: message.sdp }));
    } else if (message.type == "create-answer") {
      if (ws != receiverSocket) {
        return;
      }
      senderSocket?.send(JSON.stringify({ type: "answer", sdp: message.sdp }));
    } else if (message.type == "iceCandidate") {
      if (ws === senderSocket) {
        receiverSocket?.send(
          JSON.stringify({ type: "iceCandidate", candidate: message.candidate })
        );
      } else if (ws === receiverSocket) {
        senderSocket?.send(
          JSON.stringify({ type: "iceCandidate", candidate: message.candidate })
        );
      }
    }
  });
});
