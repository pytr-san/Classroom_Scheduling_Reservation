import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Login.module.css";
import useAuth from "../Hooks/useAuth";
import { FaEnvelope, FaLock } from "react-icons/fa";

export default function Login() {
    const userRef = useRef();
    const navigate = useNavigate();
    const { setAuth } = useAuth();

    const [errorMessage, setErrorMessage] = useState("");
    const [data, setData] = useState({
        email: "",
        password: "",
    });

    useEffect(() => {
        userRef.current.focus();
    }, []);

    useEffect(() => {
        setErrorMessage("");
    }, [data.email, data.password]);

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post("http://localhost:8000/auth/login", data, {
                withCredentials: true,
            });

            console.log("✅ Login successful:", response.data);
            const { user, token } = response.data;
            const name = user.name;
            const role = user.role;

            setAuth({ name, user, token, role });
            console.log("Setting auth with:", { user, token, role });
            navigate("/");
        } catch (err) {
            if (err.response) {
                setErrorMessage(err.response.data.error);
            } else {
                setErrorMessage("An unexpected error occurred. Please try again.");
            }
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.leftSection}>
                <h1 className={styles.title}>Classroom Scheduling and Reservation System</h1>
            </div>

            <div className={styles.rightSection}>
                <div className={styles.formContainer}>
                    <form onSubmit={handleLogin}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Email</label>
                            <div className={styles.inputWrapper}>
                                <FaEnvelope className={styles.inputIcon} />
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className={styles.input}
                                    ref={userRef}
                                    value={data.email}
                                    onChange={(e) => setData({ ...data, email: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Password</label>
                            <div className={styles.inputWrapper}>
                                <FaLock className={styles.inputIcon} />
                                <input
                                    type="password"
                                    placeholder="Enter password"
                                    className={styles.input}
                                    value={data.password}
                                    onChange={(e) => setData({ ...data, password: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className={styles.loginButton}>Login</button>

                        <a href="/forgot-password" className={styles.forgotPasswordLink}>
                            Forgot Password?
                        </a>
                    </form>

                    {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}

                    <div className={styles.signUpContainer}>
                    <button
                        type="button"
                        className={styles.signUpButton}
                        onClick={() => navigate("/register")}
                    >
                        Sign Up
                    </button>

                    </div>
                </div>
            </div>
        </div>
    );
}