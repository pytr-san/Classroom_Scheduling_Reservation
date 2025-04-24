import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Register.module.css";
import useAuth from "../Hooks/useAuth";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import accesslogo from "../assets/bg.png";
import toast from "react-hot-toast";

export default function Register() {
    const navigate = useNavigate();
    const { setAuth } = useAuth();

    const [errors, setErrors] = useState({});
    const [data, setData] = useState({
        name: "",
        email: "",
        password: "",
        reTypePassword: "",
        role: "",
    });

    const handleRegister = async (e) => {
        e.preventDefault();
        setErrors({});
        
        let newErrors = {};

        if (!data.name.trim()) newErrors.name = "Name is required.";
        if (!data.email.trim()) {
            newErrors.email = "Email is required.";
        } else if (!data.email.endsWith("@spist.edu.ph")) {
            newErrors.email = "Only @spist.edu.ph emails are allowed.";
        }
        if (!data.password) {
            newErrors.password = "Password is required.";
        } else if (data.password.length < 8) {
            newErrors.password = "Password must be at least 8 characters.";
        }else if (!/[!@#$%^&*(),.?":{}|<>]/.test(data.password)) {
            newErrors.password = "Password must include at least one special character (e.g., @, #, $).";
        }
        if (data.password !== data.reTypePassword) {
            newErrors.reTypePassword = "Passwords do not match.";
        }
        if (!data.role) {
            newErrors.role = "Role selection is required.";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            const response = await axios.post("http://localhost:8000/auth/register", data, { withCredentials: true });
            const { user } = response.data;
            const role = user?.role;
            const name = user?.name;
            
            if (role === "student") {
                toast.success("Registration successful!");
                setAuth({ user });
                setTimeout(() => {
                navigate("/register/newstudent", { state: { user } });
                }, 2000); 
            } else {
                toast.success("Registration successful! Please log in.");
                setTimeout(() => {
                    navigate("/login", { state: { name } });
                }, 2000); // Delay in milliseconds (e.g., 1500ms = 1.5 seconds)
            }
            
        } catch (error) {
            setErrors({ server: error.response?.data?.error || "Something went wrong. Please try again." });
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData((prevData) => ({
            ...prevData,
            [name]: value,
        }));

        setErrors((prevErrors) => {
            const newErrors = { ...prevErrors };
            if (name in newErrors) delete newErrors[name];
            if (name === "role" && value) delete newErrors.role;
            return newErrors;
        });
    };

    return (
        <div className={styles.container}>
            <div className={styles.leftSection}>
                <h1 className={styles.title}>Classroom Scheduling and Reservation System</h1>
                <img src={accesslogo} alt="Access Logo" className={styles.logo} />
            </div>
            <div className={styles.rightSection}>
                <form onSubmit={handleRegister} className={styles.formContainer}>
                    <h4 className={styles.signup}> SIGN UP FORM</h4>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Select Role</label>
                        {errors.role && <p className={styles.errorMessage}>{errors.role}</p>}
                        {errors.server && <div className="alert alert-danger">{errors.server}</div>}
                        <select 
                            name="role" 
                            value={data.role} 
                            onChange={handleChange}
                            className={styles.input}
                        >
                            <option value="">Select Role</option>
                            <option value="Faculty">Faculty</option>
                            <option value="Student">Student</option>
                        </select>
                    </div>
                    
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>NAME</label>
                        {errors.name && <p className={styles.errorMessage}>{errors.name}</p>}
                        <div className={styles.inputWrapper}>
                            <FaUser className={styles.inputIcon} />
                            <input
                                type="text"
                                name="name"
                                placeholder="Enter your name"
                                className={styles.input}
                                value={data.name}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>EMAIL</label>
                        {errors.email && <p className={styles.errorMessage}>{errors.email}</p>}
                        <div className={styles.inputWrapper}>
                            <FaEnvelope className={styles.inputIcon} />
                            <input
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                className={styles.input}
                                value={data.email}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>PASSWORD</label>                       
                        {errors.password && <p className={styles.errorMessage}>{errors.password}</p>}
                        <div className={styles.inputWrapper}>
                            <FaLock className={styles.inputIcon} />
                            <input
                                type="password"
                                name="password"
                                placeholder="Enter password"
                                className={styles.input}
                                value={data.password}
                                onChange={handleChange}
                            />
                        </div>
                        <p className={styles.hintText}>8 characters or longer. At least one special character (e.g., @, #, $)</p>
                    </div>
                    
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>RE-TYPE PASSWORD</label>
                        {errors.reTypePassword && <p className={styles.errorMessage}>{errors.reTypePassword}</p>}
                        <div className={styles.inputWrapper}>
                            <FaLock className={styles.inputIcon} />
                            <input
                                type="password"
                                name="reTypePassword"
                                placeholder="Re-type password"
                                className={styles.input}
                                value={data.reTypePassword}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    
                    <button type="submit" className={styles.registerButton}>
                        Sign up
                    </button>
                    
                    <p className={styles.loginText}>Already have an account?<a 
                    className={styles.loginLink}
                    onClick={() => navigate("/login")}> Login?</a></p>
                    {/* <button 
                        type="button" 
                        className={styles.loginButton}
                        onClick={() => navigate("/login")}
                    >
                        Login?
                    </button> */}
                </form>
            </div>
        </div>
    );
}