import { useState, useEffect } from 'preact/hooks';
import NavBar from './components/navbar';
import wretch from "wretch";
import "@fontsource/inter";
import Cookies from 'universal-cookie';
import { useLocation } from 'preact-iso';

export default function Home() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [errorMsgType, setErrorMsgType] = useState('text-danger');
    const [loginFunction, setLoginFunction] = useState('');
    let [apiHostname, setApiHostname] = useState('');

    const cookies = new Cookies(null, { path: '/' });

    const loginToAccount = async (e) => {
        e.preventDefault();
        
        setError("");
        setErrorMsgType("text-danger");
        
        if(apiHostname.slice(-1) === '/') {
            apiHostname = apiHostname.slice(0, -1);
        }

        /* TODO: make them separate pages later */
        if(loginFunction == "login") {
            // i DESPISE fetch
            wretch(`${apiHostname}/auth/login`)
                .post({ username, password })
                .error(400, (err) => {
                    console.log(err);
                    setError("Bad request");
                })
                .error(401, (err, res) => {
                    setError("Invalid username or password");
                })
                .res(async (response) => { 
                    setErrorMsgType('text-success');
                    setError("You are being logged in");

                    const respjson = await response.json();
                    if(respjson.success && respjson.success === true) {
                        cookies.set('noteauth_hostname', apiHostname);
                        cookies.set('noteauth_token', respjson.token);

                        window.location.href = '/app';
                    } else {
                        setErrorMsgType('text-danger');
                        setError("Unknown error");
                    }
                })
                .catch(error => { setError("Something went wrong. Try a different hostname?") })
        } else {
            wretch(`${apiHostname}/auth/register`)
                .post({ username, password })
                .error(400, (err) => {
                    if(err.json.error) {
                        setError(err.json.error);
                    } else {
                        setError("Bad Request");
                    }
                })
                .error(500, (err, res) => {
                    if(err.json.error) {
                        setError(err.json.error);
                    } else {
                        setError("Internal server error");
                    }
                })
                .res(async (response) => { 
                    setErrorMsgType('text-success');
                    setError("You have been signed up! You may now login.");
                })
                .catch(error => {
                    if(error.json?.error) {
                        setError(error.json?.error);
                    } else {
                        setError("Something went wrong. Try a different hostname?")
                    }
                })
        }
    };

    const authToken = cookies.get("noteauth_token");
    const { url } = useLocation();

    useEffect(() => {
        if (!!authToken) {
            window.location.href = "/app"; // redirect if logged in
        }
    }, [authToken, url]);

    return (
        <div className="layout">
            <NavBar />

            <div className="container">
                <h1>Login</h1>
                <p>Please login to continue</p>

                <form onSubmit={loginToAccount}>
                    <div className="form-data-styling">
                        <label for="login-user-input" className="form-data-title">Username: <span className="text-danger">*</span></label>
                        <input 
                            type="text" 
                            id="login-user-input"
                            placeholder="Username" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)}
                            className="login-form-input"
                            required 
                        />
                    </div>
                    
                    <div className="form-data-styling">
                        <label for="login-pwd-input" className="form-data-title">Password: <span className="text-danger">*</span></label>
                        <input 
                            type="password" 
                            id="login-pwd-input"
                            placeholder="Password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                            className="login-form-input"
                            required 
                        />
                    </div>

                    <div className="form-data-styling">
                        <label for="login-api-hostname-input" className="form-data-title">URL: <span className="text-danger">*</span></label>
                        <input 
                            type="url" 
                            id="login-api-hostname-input"
                            placeholder="API Hostname (e.g., https://api.example.com)" 
                            value={apiHostname} 
                            onChange={(e) => setApiHostname(e.target.value)}
                            className="login-form-input"
                            required 
                        />
                    </div>

                    <input type="hidden" name="loginFormAction" id="loginFormAction" value="login" />

                    <div className="button-flex">
                        <button className="btn btn-primary" onClick={() => {setLoginFunction("login")}} type="submit">Login</button>

                        <button className="btn btn-secondary" onClick={() => {setLoginFunction("register")}} type="submit">Sign Up</button>
                    </div>
                </form>

                <p className={errorMsgType}>{error}</p>
            </div>
        </div>
    );
}
