import io from "socket.io-client";
import { SOCKET_URL } from "../config/env";

/*
const socket = io("http://192.168.1.9:3000", {
  transports: ["websocket"],
});*/

const socket = io(SOCKET_URL, {
  transports: ["websocket"],
});

export default socket;
