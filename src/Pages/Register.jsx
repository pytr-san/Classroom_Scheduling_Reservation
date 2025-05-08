import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import  axiosInstance  from './../axios.jsx';
import styles from "./Register.module.css";
import useAuth from "../Hooks/useAuth";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import accesslogo from "../assets/bg.png";
import toast from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Register() {
    const navigate = useNavigate();
    const { setAuth } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [showReTypePassword, setShowReTypePassword] = useState(false);
    const [facultyPasscodeFromApi, setFacultyPasscodeFromApi] = useState("");
    const [errors, setErrors] = useState({});
    const [courses, setCourses] = useState([]);
    const [sections, setSections] = useState([]);
    
    const [data, setData] = useState({
        name: "",
        email: "",
        password: "",
        reTypePassword: "",
        role: "",
        course: "",
        year_level: "",
        section: "",
        facultyPasscode: "",
    });

    const fetchFacultyPasscode = async () => {
        try {
            const response = await axiosInstance.get("/api/faculty-passcode");
            setFacultyPasscodeFromApi(response.data.passcode);  
        } catch (error) {
            toast.error("Unable to fetch faculty passcode.");
        }
    };

    useEffect(() => {
        if (data.role === "Faculty") {
            fetchFacultyPasscode();  
        }
    }, [data.role]);
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await axiosInstance.get("/api/course");
                setCourses(res.data);

                const sec = await axiosInstance.get("/api/sections");
                setSections(sec.data);
            } catch (err) {
                console.error("Error fetching courses", err);
            }
        };
        fetchCourses();
    }, []);

      
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
        } else if (data.password.length < 16) {
            newErrors.password = "Password must be at least 16 characters.";
        }else if (!/[A-Z]/.test(data.password)) {
            newErrors.password = "Password must include at least one uppercase letter.";
        }else if (!/[!@#$%^&*(),.?":{}|<>]/.test(data.password)) {
            newErrors.password = "Password must include at least one special character (e.g., @, #, $).";
        }
        if (data.password !== data.reTypePassword) {
            newErrors.reTypePassword = "Passwords do not match.";
        }
        if (!data.role) {
            newErrors.role = "Role selection is required.";
        }
        if (data.role === "Faculty" && data.facultyPasscode !== facultyPasscodeFromApi) {
            toast.error("Incorrect Passcode!");          
            newErrors.facultyPasscode = "Invalid faculty passcode.";
        } else if (data.role === "Student") {
            if (!data.course) newErrors.course = "Course is required.";
            if (!data.year_level) newErrors.year_level = "Year level is required.";
            if (!data.section) newErrors.section = "Section is required.";
        }

        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            const response = await axiosInstance.post("/auth/register", data, {
                headers: {
                  "no-refresh": true,
                },
              });
            const { user } = response.data;

            if (data.role === "Student") {

                await axiosInstance.post(`/api/student/details?email=${user.email}`, {
                    course_id: data.course,  // Pass course_id
                    year_level: data.year_level,  // Pass year level
                    section_id: data.section  // Pass section id
                });
    
                toast.success("Student Registration successful! Please log in.");
                setTimeout(() => {
                    navigate("/login");
                }, 2000);
            } else {
                toast.success("Registration successful! Please log in.");
                setTimeout(() => {
                    navigate("/login");
                }, 2000);
            }
            
        } catch (error) {
            setErrors({ server: error.response?.data?.error || "Something went wrong. Please try again." });
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        const updatedValue = name === 'email' ? value.toLowerCase() : value;

        setData((prevData) => ({
            ...prevData,
            [name]: (name === 'course' || name === 'section') ? parseInt(updatedValue) : updatedValue,  // Ensure course and section are integers
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
                <h1 className={styles.title}>Classroom Scheduling System</h1>
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
                    
                    {data.role === "Student" && (
                        <>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Course</label>
                                {errors.course && <p className={styles.errorMessage}>{errors.course}</p>}
                                <select
                                    name="course"
                                    value={data.course}
                                    onChange={handleChange}
                                    className={styles.input}
                                >
                                    <option value="">Select Course</option>
                                    {courses.map(course => (
                                        <option key={course.course_id} value={course.course_id}>
                                            {course.course_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Year Level</label>
                                {errors.year_level && <p className={styles.errorMessage}>{errors.year_level}</p>}
                                <select
                                    name="year_level"
                                    value={data.year_level}
                                    onChange={handleChange}
                                    className={styles.input}
                                >
                                    <option value="">Select Year</option>
                                    <option value="1st Year">1st Year</option>
                                    <option value="2nd Year">2nd Year</option>
                                    <option value="3rd Year">3rd Year</option>
                                    <option value="4th Year">4th Year</option>
                                </select>
                            </div>

                            <div className={styles.inputGroup}>
                            <label className={styles.label}>Section</label>
                            {errors.section && <p className={styles.errorMessage}>{errors.section}</p>}
                            <select
                                name="section"
                                value={data.section}
                                onChange={handleChange}
                                className={styles.input}
                            >
                                <option value="">Select Section</option>
                                {sections.map((section) => (
                                    <option key={section.section_id} value={section.section_id}>
                                        Section {section.section} 
                                    </option>
                                ))}
                            </select>
                        </div>

                        </>
                    )}

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
                               type={showPassword ? "text" : "password"}
                               autoComplete="off"
                                name="password"
                                placeholder="Enter password"
                                className={styles.input}
                                value={data.password}
                                onChange={handleChange}
                            />
                              <span
                                onClick={() => setShowPassword(!showPassword)}
                                className={styles.eyeToggle}
                            >
                                {showPassword ?  <FaEye /> : <FaEyeSlash />}
                            </span>
                        </div>
                        <p className={styles.hintText}>16 characters or longer. At least one special character(e.g., @, #, $) and one uppercase letter(e.g.,A-Z) </p>
                    </div>
                    
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>RE-TYPE PASSWORD</label>
                        {errors.reTypePassword && <p className={styles.errorMessage}>{errors.reTypePassword}</p>}
                        <div className={styles.inputWrapper}>
                            <FaLock className={styles.inputIcon} />
                            <input
                                type={showReTypePassword ? "text" : "password"}
                                autoComplete="off"
                                name="reTypePassword"
                                placeholder="Re-type password"
                                className={styles.input}
                                value={data.reTypePassword}
                                onChange={handleChange}
                            />
                            <span
                                onClick={() => setShowReTypePassword(!showReTypePassword)}
                                className={styles.eyeToggle}
                            >
                                {showReTypePassword ? <FaEye /> : <FaEyeSlash />}
                            </span>
                        </div>
                    </div>
                    <p className={styles.termsText}>
                        By signing up, you agree to our <Link to="/terms-of-service" className={styles.link}>Terms of Service</Link> and 
                        <Link to="/privacy-policy" className={styles.link}>Privacy Policy</Link>.
                    </p>

                    {data.role === "Faculty" && (
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Faculty Passcode</label>
                            {errors.facultyPasscode && <p className={styles.errorMessage}>{errors.facultyPasscode}</p>}
                            <div className={styles.inputWrapper}>
                                <FaLock className={styles.inputIcon} />
                                <input
                                    type="password"
                                    name="facultyPasscode"
                                    placeholder="Enter faculty passcode"
                                    className={styles.input}
                                    value={data.facultyPasscode}
                                    onChange={handleChange}
                                />
                            </div>
                            <p className={styles.hintText}>(Contact access admin for the passcode)</p>
                        </div>
                    )}

                    <button type="submit" className={styles.registerButton}>
                        Sign up
                    </button>
                    
                    <p className={styles.loginText}>Already have an account?<a 
                    className={styles.loginLink}
                    onClick={() => navigate("/login")}> Login?</a></p>
                </form>
            </div>
        </div>
    );
}