import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Login.module.css";

export default function Login({setAuth}) {


    const navigate = useNavigate();

    const [errorMessage, setErrorMessage] = useState('');

    const [data, setData] =  useState({

        username: '',
        password: '',
    })

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:8000/auth/login", data, { withCredentials: true });
    
            console.log("Login Response:", response); // ✅ Debugging log

            if (response.status === 200 || response.status === 201) { // ✅ Allow both 200 & 201
                localStorage.setItem("token", response.data.token); // Store JWT token
                setAuth(true); // Updates state in App.jsx
                localStorage.setItem("isAuthenticated", "true"); // Stores in localStorage
                navigate('/');
            }
    
        } catch (err) {
            if (err.response) {
                console.error("Login Error:", err.response.data.error);
                setErrorMessage(err.response.data.error); // Update state to show error in UI
            } else {
                console.error("Something went wrong:", err);
                setErrorMessage("An unexpected error occurred. Please try again.");
            }
        }
    };

    return (
    <>
        <div className={styles.container}>
            <div className={styles.formContainer}>
                <h2>Login</h2>
                <form onSubmit={handleLogin}>
                    <label className={styles.label}>Email or Phone Number</label>
                    <input
                        type="text"
                        placeholder="Enter email or Phone Number"
                        className={styles.input}
                        value={data.username}
                        onChange={(e) => setData({ ...data, username: e.target.value })}
                        required
                    />
                    <label className={styles.label}>Password</label>
                    <input
                        type="password"
                        placeholder="Enter password"
                        className={styles.input}
                        value={data.password}
                        onChange={(e) => setData({ ...data, password: e.target.value })}
                        required
                    />
                    <button type="submit" className={styles.button}>Login</button>
                </form>
                <button className={styles.registerButton} onClick={() => navigate("/register")}>Go to Register</button>
                {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
            </div>
        </div>
    </>
    )
}