import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Register.module.css";
import { FaUser, FaEnvelope, FaLock, FaCheckCircle } from "react-icons/fa";
import accesslogo from "../assets/bg.png";
import axios from "axios";

export default function Register() {
    const navigate = useNavigate();
    const [errors, setErrors] = useState({});

    const [data, setData] = useState({
        name: "",
        email: "",
        password: "",
        reTypePassword: "",
    });

    const [passwordValid, setPasswordValid] = useState(null);
    const [passwordMatch, setPasswordMatch] = useState(null);

    // ✅ Password Validation Function
    const validatePassword = (password) => {
        return password.length >= 8 && /[!@#$%^&*(),.?":{}|<>]/.test(password);
    };

    // ✅ Real-time validation
    useEffect(() => {
        if (data.password.length === 0) {
            setPasswordValid(null);
        } else {
            setPasswordValid(validatePassword(data.password));
        }

        if (data.password && data.reTypePassword) {
            setPasswordMatch(data.password === data.reTypePassword);
        } else {
            setPasswordMatch(null);
        }
    }, [data.password, data.reTypePassword]);

    const handleRegister = async (e) => {
        e.preventDefault();
        let newErrors = {};

        if (!data.name.trim()) newErrors.name = "Name is required.";
        if (!data.email.trim()) {
            newErrors.email = "Email is required.";
        } else if (!data.email.endsWith("@spist.edu.ph")) {
            newErrors.email = "Only @spist.edu.ph emails are allowed.";
        }
        if (!data.password) {
            newErrors.password = "Password is required.";
        } else if (!validatePassword(data.password)) {
            newErrors.password = "Password must be at least 6 characters and include a special character.";
        }
        if (data.password !== data.reTypePassword) {
            newErrors.reTypePassword = "Passwords do not match.";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            const response = await axios.post("http://localhost:8000/auth/register", data, { withCredentials: true });
            if (response.status === 201) {
                navigate("/login");
            }
        } catch (err) {
            setErrors({ server: err.response?.data?.error || "Something went wrong. Please try again." });
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData({ ...data, [name]: value });
    
        // Remove the error when the user corrects the input
        setErrors((prevErrors) => {
            const newErrors = { ...prevErrors };
            if (name === "name" && value.trim()) delete newErrors.name;
            if (name === "email") {
                if (value.trim()) delete newErrors.email;
                if (value.endsWith("@spist.edu.ph")) delete newErrors.email;
            }
            if (name === "password") {
                if (value.length >= 6 && /[!@#$%^&*(),.?":{}|<>]/.test(value)) delete newErrors.password;
            }
            if (name === "reTypePassword" && value === data.password) delete newErrors.reTypePassword;
            return newErrors;
        });
    };
    
    return (
        <div className={styles.container}>
            <div className={styles.imageContainer}>
                <img src={accesslogo} alt="Access Logo" className={styles.logoImage} />
            </div>

            <div className="div1">
                <form onSubmit={handleRegister} className={styles.formContainer}>
                    <h2 className={styles.title}>REGISTRATION FORM</h2>

                    {errors.server && <p className={styles.errorMessage}>{errors.server}</p>}

                    {/* Name Input */}
                    <div className={styles.inputGroup}>
                        <label className={styles.label} htmlFor="fullName">
                            <FaUser className={styles.icon} /> Name
                        </label>
                        {errors.name && <p className={styles.errorMessage}>{errors.name}</p>}
                        <input
                            id="fullName"
                            type="text"
                            name="name"
                            placeholder="Enter full name"
                            value={data.name}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Email Input */}
                    <div className={styles.inputGroup}>
                        <label className={styles.label} htmlFor="email">
                            <FaEnvelope className={styles.icon} /> Email
                        </label>
                        {errors.email && <p className={styles.errorMessage}>{errors.email}</p>}
                        <input
                            id="email"
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={data.email}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Password Input with Check Icon */}
                    <div className={styles.inputGroup}>
                        <label className={styles.label} htmlFor="password">
                            <FaLock className={styles.icon} /> Password  <p className={styles.passwordHint}>
                               Password must be 8+ characters with at least one special character (e.g., @, #, $).
                            </p>
                        </label>
                        {errors.password && <p className={styles.errorMessage}>{errors.password}</p>}
                        <div className={styles.inputWithIcon}>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                placeholder="Enter password"
                                value={data.password}
                                onChange={handleChange}
                            /> 
                            {data.password && (
                                <FaCheckCircle
                                    className={styles.checkIcon}
                                    style={{
                                        color: passwordValid === null ? "gray" : passwordValid ? "green" : "red",
                                    }}
                                />
                            )}

                        </div>
                    </div>

                    {/* Re-type Password Input with Check Icon */}
                    <div className={styles.inputGroup}>
                        <label className={styles.label} htmlFor="confirmPassword">
                            <FaLock className={styles.icon} /> Re-type Password
                        </label>
                        {errors.reTypePassword && <p className={styles.errorMessage}>{errors.reTypePassword}</p>}
                        <div className={styles.inputWithIcon}>
                            <input
                                id="confirmPassword"
                                type="password"
                                name="reTypePassword"
                                placeholder="Re-type password"
                                value={data.reTypePassword}
                                onChange={handleChange}
                            />
                            {data.reTypePassword && (
                                <FaCheckCircle
                                    className={styles.checkIcon}
                                    style={{
                                        color: passwordMatch === null ? "gray" : passwordMatch ? "green" : "red",
                                    }}
                                />
                            )}
                        </div>
                    </div>

                    <div className={styles.buttonContainer}>
                        <button type="submit" className={styles.confirmBtn}>
                            Sign up
                        </button>
                        <p>Already have an account?</p>
                        <button className={styles.loginBtn} onClick={() => navigate("/login")}>
                            Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
