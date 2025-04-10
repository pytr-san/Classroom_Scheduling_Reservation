import { useState, useEffect, useRef } from "react";
//import { Link, useNavigate, useLocation, replace} from "react-router-dom";
import axios from "axios";
import styles from "./Login.module.css";
import useAuth from "../Hooks/useAuth";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthProvider";
import { useLocation } from "react-router-dom";

export default function Login({setIsAuthenticated, setUser}) {

    const userRef = useRef();
    const navigate = useNavigate();
    const location = useLocation();
 // Access the user data passed via state

     const { setAuth} = useAuth();

    const [errorMessage, setErrorMessage] = useState('');

    const [data, setData] =  useState({

        email: '',
        password: '',
    })
    
    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            // Send login request with credentials (so cookie is stored)
            const response = await axios.post("http://localhost:8000/auth/login", data, { withCredentials: true });

            console.log("✅ Login successful:", response.data);
           // const { user, token, role } = response.data;
            const { user, token } = response.data;
            const role = user.role;
            
            setAuth({ user, token, role}); // ✅ Stores user data globally
            navigate("/");
    
        } catch (err) {
            if (err.response) {
                setErrorMessage(err.response.data.error); // Show error in UI
            } else {
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
                    <label className={styles.label}>Email</label>
                    <input
                        type="email"
                        placeholder="Enter email"
                        className={styles.input}
                        ref={userRef}
                        value={data.email}
                        onChange={(e) => setData({ ...data, email: e.target.value })}
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