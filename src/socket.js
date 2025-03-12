import { io } from "socket.io-client";
import Cookies from "universal-cookie";
import toast from "react-hot-toast";

var haveBeenOnlineBefore = false;

const cookies = new Cookies(null, { path: "/" });

const socket = io(cookies.get("noteauth_hostname"), {
    query: { token: cookies.get("noteauth_token") },
    transports: ["websocket"],
});

let debounceConnectTimeout;
let debounceDisconnectTimeout;

socket.on("connect", () => {
    // debounce
    clearTimeout(debounceConnectTimeout);

    debounceConnectTimeout = setTimeout(() => {
        // 'you're online!' toast
        if (haveBeenOnlineBefore) {
            toast.success("You're back online!");
        }

        haveBeenOnlineBefore = true;

        console.log("Connected to WebSocket server");
    }, 300);
});

socket.on("disconnect", (reason) => {
    // debounce
    clearTimeout(debounceDisconnectTimeout);

    debounceDisconnectTimeout = setTimeout(() => {
        // 'youre offline' toast
        console.log(`Disconnected from WebSocket server. Reason: ${reason}`);
        toast.error("You're offline");
    }, 300);
});

export default socket;
