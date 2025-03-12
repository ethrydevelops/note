import { io } from "socket.io-client";
import Cookies from "universal-cookie";

const cookies = new Cookies(null, { path: "/" });

const socket = io(cookies.get("noteauth_hostname"), {
    query: { token: cookies.get("noteauth_token") },
    transports: ["websocket"],
});

socket.on("connect", () => {
    console.log("Connected to WebSocket server");
});

export default socket;
