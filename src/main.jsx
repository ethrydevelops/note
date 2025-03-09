import { lazy, LocationProvider, ErrorBoundary, Router, Route } from "preact-iso";
import { render } from "preact";
import "./index.css";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

const Home = lazy(() => import("./app.jsx"));
const NotFound = lazy(() => import("./notfound.jsx"));
const LoginPage = lazy(() => import("./loginpage.jsx"));
const LogoutPage = lazy(() => import("./logoutfunction.jsx"));

const App = () => (
    <LocationProvider>
        <ErrorBoundary>
            <Router>
                <Route path="/" component={LoginPage} />

                {/* Protect routes individually instead of wrapping them */}
                <Route path="/app" component={() => <ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/logout" component={() => <ProtectedRoute><LogoutPage /></ProtectedRoute>} />

                {/* 404 Fallback */}
                <NotFound default />
            </Router>
        </ErrorBoundary>
    </LocationProvider>
);

render(<App />, document.getElementById("app"));
