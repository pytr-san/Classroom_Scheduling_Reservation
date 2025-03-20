import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login({setAuth}) {


    const navigate = useNavigate();

    const handleLogin = (e) => {
        // Simulate successful login
        e.preventDefault();
        setAuth(true);
        navigate("/");
    };

    const [data, setData] =  useState({

        email: '',
        password: '',
    })

    // const  LoginUser = (e) =>{
    //     e.preventDefault()
    //     axios.get('/')
    // }
    return (
    <>
        <div>
            <form onSubmit={handleLogin}>
                <label>Email</label>
                <input type='email' placeholder='enter email' value= {data.email} onChange = {(e) => setData({...data, email: e.target.value})} />
                <label>Password</label>
                <input type='password' placeholder='enter password' value= {data.password} onChange = {(e) => setData({...data, password: e.target.value})} />
                <button type='submit'>Login</button>
            </form>
            <button onClick={() => navigate("/register")}>Go to Register</button>
        </div>
    </>
    )
}