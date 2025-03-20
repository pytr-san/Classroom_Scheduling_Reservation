import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Register.module.css";
import { FaUser, FaEnvelope, FaLock, FaCheckCircle } from "react-icons/fa";
import accesslogo from "../assets/bg.png";

export default function Register({setAuth}) {

    const navigate = useNavigate();

    const handleRegister = (e) => {
        // Simulate successful login
        e.preventDefault()
        setAuth(true);
        navigate("/");

    }

    const [data, setData] = useState({
        name: '',
        email: '',
        password:'',
        reTypePassword:'',
    })


    return (
    <>
        {/* <div>
            <form onSubmit={handleRegister}>
                <label>Name</label>
                <input type='text' placeholder='enter name' value= {data.name} onChange={(e) => setData({...data, name: e.target.value})} />
                <label>Email</label>
                <input type='email' placeholder='enter email' value= {data.email} onChange={(e) => setData({...data, email: e.target.value})} />
                <label>Password</label>
                <input type='password' placeholder='enter password' value= {data.password} onChange={(e) => setData({...data, password: e.target.value})} />
                <button type='submit'>Submit</button>
            </form>
            <button onClick={() => navigate("/login")}>Already have an account? Login</button>
        </div> */}
    <div className={styles.container}>
          
        <div className={styles.imageContainer}>
            <img src={accesslogo} alt="Access Logo" className={styles.logoImage} />
        </div>

        <div className="div1">
        <form onSubmit={handleRegister}  className={styles.formContainer}>
            <h2 className={styles.title}>REGISTRATION FORM</h2>

            <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="fullName">
                    <FaUser className={styles.icon} /> Name
                </label>
                <input id="fullName" type="text" placeholder="Enter full name" value= {data.name} onChange={(e) => setData({...data, name: e.target.value})}/>
            </div>

            <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="email">
                    <FaEnvelope className={styles.icon} /> Email
                </label>
                <input id="email" type="email" placeholder="Enter your email" value= {data.email} onChange={(e) => setData({...data, email: e.target.value})} />
            </div>

            <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="password">
                    <FaLock className={styles.icon} /> Password
                </label>
                <input id="password" type="password" placeholder="Enter password" value= {data.password} onChange={(e) => setData({...data, password: e.target.value})} />
            </div>

            <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="confirmPassword">
                    <FaLock className={styles.icon} /> Re-type Password
                </label>
                <div className={styles.inputWithIcon}>
                    <input id="confirmPassword" type="password" placeholder="Re-type password" value= {data.reTypePassword} onChange={(e) => setData({...data, reTypePassword: e.target.value})} />
                    <FaCheckCircle className={styles.checkIcon} />
                </div>
            </div>

            <div className={styles.buttonContainer}>
                <button type="submit"className={styles.confirmBtn}>Confirm</button>
                <p>Already have an account?</p>
                <button className={styles.loginBtn} onClick={() => navigate("/login")}>Login</button>
            </div>
           </form>
        </div>
    </div>
    </>
    );

}

