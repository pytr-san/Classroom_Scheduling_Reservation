import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Register.module.css";
import { FaUser, FaEnvelope, FaLock, FaCheckCircle } from "react-icons/fa";
import accesslogo from "../assets/bg.png";
import axios from "axios";
import useAuth from "../Hooks/useAuth";

export default function Register() {
    const navigate = useNavigate();
    const [errors, setErrors] = useState({});
    const { setAuth } = useAuth();

    const [data, setData] = useState({
        name: "",
        email: "",
        password: "",
        reTypePassword: "",
        role: "", 
    });

    const [passwordValid, setPasswordValid] = useState(false);
    const [passwordMatch, setPasswordMatch] = useState(false);
    // useEffect(()=> {
    //     userRef.current.focus();
    // })
    useEffect(() => {
        setPasswordValid(data.password.length === 0 ? false : data.password.length >= 8 && /[!@#$%^&*(),.?":{}|<>]/.test(data.password));
        setPasswordMatch(data.password && data.reTypePassword ? data.password === data.reTypePassword : false);
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
        } else if (!passwordValid) {
            newErrors.password = "Password must be at least 8 characters and include a special character.";
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

            console.log("🚀 Server Response:", response.data);

            const { user } = response.data;
            const role = user?.role; // Ensure `role` exists before checking
            const name = user?.name;
            if (role === "student") {
                console.log("✅ Role is student. Navigating to /newstudent...");
                setAuth({ user });  
                navigate("/register/newstudent", { state: { user } });
            } else {
                console.log("❌ Role is not student. Navigating to /login...");
                navigate("/login", { state: { name } });
            }
            
        } catch (err) {
            setErrors({ server: err.response?.data?.error || "Something went wrong. Please try again." });
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData({ ...data, 
            [name]: value
        });

        setErrors((prevErrors) => {
            const newErrors = { ...prevErrors };
            if (name in newErrors) delete newErrors[name];
        if (name === "role" && value) delete newErrors.role;
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
                    <div className={styles.inputGroup}>
                        <label className={styles.label} htmlFor="role">Role</label>
                        {errors.role && <p className={styles.errorMessage}>{errors.role}</p>}
                        <select id="role" name="role" value={data.role} onChange={handleChange}>
                            <option value="">Select Role</option>
                            <option value="Faculty">Faculty</option>
                            <option value="Student">Student</option>
                        </select>
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.label} htmlFor="fullName">
                            <FaUser className={styles.icon} /> Name
                        </label>
                        {errors.name && <p className={styles.errorMessage}>{errors.name}</p>}
                        <input id="fullName" type="text" name="name" placeholder="Enter full name" required value={data.name} onChange={handleChange} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.label} htmlFor="email">
                            <FaEnvelope className={styles.icon} /> Email
                        </label>
                        {errors.email && <p className={styles.errorMessage}>{errors.email}</p>}
                        <input id="email" type="email" name="email" placeholder="Enter your email" value={data.email} onChange={handleChange} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.label} htmlFor="password">
                            <FaLock className={styles.icon} /> Password
                        </label>
                        {errors.password && <p className={styles.errorMessage}>{errors.password}</p>}
                        <div className={styles.inputWithIcon}>
                            <input id="password" type="password" name="password" placeholder="Enter password" value={data.password} onChange={handleChange} />
                            {data.password && <FaCheckCircle className={styles.checkIcon} style={{ color: passwordValid === null ? "gray" : passwordValid ? "green" : "red" }} />}
                        </div>
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.label} htmlFor="confirmPassword">
                            <FaLock className={styles.icon} /> Re-type Password
                        </label>
                        {errors.reTypePassword && <p className={styles.errorMessage}>{errors.reTypePassword}</p>}
                        <div className={styles.inputWithIcon}>
                            <input id="confirmPassword" type="password" name="reTypePassword" placeholder="Re-type password" value={data.reTypePassword} onChange={handleChange} />
                            {data.reTypePassword && <FaCheckCircle className={styles.checkIcon} style={{ color: passwordMatch === null ? "gray" : passwordMatch ? "green" : "red" }} />}
                        </div>
                    </div>
                    <div className={styles.buttonContainer}>
                        <button type="submit" className={styles.confirmBtn}>Sign up</button>
                        <p>Already have an account?</p>
                        <button className={styles.loginBtn} onClick={() => navigate("/login")}>Login</button>
                    </div>
                </form>
            </div>
        </div>
    
    );
}
