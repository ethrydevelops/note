import { h } from "preact";
import { useLocation } from "preact-iso";
import Cookies from "universal-cookie";
import { useEffect } from "preact/hooks";

const ProtectedRoute = ({ children }) => {
    const cookies = new Cookies(null, { path: "/" });
    const authToken = cookies.get("noteauth_token");
    const { url } = useLocation();

    useEffect(() => {
        if (!authToken) {
            window.location.href = "/?error=unauthenticated"; // redirect if not logged in
        }
    }, [authToken, url]);

    return authToken ? children : null;
};

export default ProtectedRoute;
