import React, { useState } from "react";
import axios from "axios";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        console.log("login request being sent");
        try {
            const res = await axios.post("/api/auth/login", { username, password }, { withCredentials: true });
            console.log("Login successful:", res.data);
            window.location.href = "/dashboard";
        } catch (err) {
            console.error("Login failed:", err.response ? err.response.data : err.message);
            setError("Invalid username or password.");
        }
    };

    return (
        <div className="container mt-4">
            <h2>Login</h2>
            {error && <p style={{color: "red"}}>{error}</p>}
            <form onSubmit={handleLogin}>
                <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)}
                       required/>
                <input type="password" placeholder="Password" value={password}
                       onChange={e => setPassword(e.target.value)} required/>
                <button type="submit">Log In</button>
            </form>

            <hr/>
            <p>Or log in with GitHub:</p>
            <a href="https://a4-charlotte-f-roscoe.netifly.app/auth/github/" className="btn btn-dark">GitHub</a>
        </div>
    );
};

export default Login;
