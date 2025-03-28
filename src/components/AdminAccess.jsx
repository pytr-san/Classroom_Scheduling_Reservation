import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom"; 
import "./AdminAccess.css"; 
import axios from "axios";
import doggoSecurity from "../assets/doggoSecurity.jpg";

function AdminAccess({onAccessGranted }) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState(false);
  const inputsRef = useRef([]);

  const navigate = useNavigate();

  const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN; // 🔥 Use env variable
  
  const handleInputChange = (index, value) => {
    if (/^[0-9]?$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      if (value !== "" && index < 5) {
        inputsRef.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleSubmit = async () => {
    const accessCode = code.join("");
    try {
      const response = await axios.post("http://localhost:8000/api/admin/verify-pin", { pin: accessCode } , { withCredentials: true });
      console.log("Status:",response.data)
      if (response.data.success) {
        onAccessGranted(); 
      } else {
        setError(true);
        setCode(["", "", "", "", "", ""]);
        inputsRef.current[0].focus();
      }
    } catch (error) {
      setError(true);
    }
  };
  // const handleSubmit = () => {
  //   const accessCode = code.join("");
  //   if (accessCode === "123456") { 
  //     navigate("/classroom"); 
  //   } else {
  //     setError(true);
  //     setCode(["", "", "", "", "", ""]);
  //     inputsRef.current[0].focus();
  //   }
  // };

  return (
    <div>
        <div className="access-code-box">
          <h3>ENTER ACCESS CODE:</h3>
          <div className="code-inputs">
            {code.map((num, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                className="code-box"
                inputMode="numeric"
                value={num}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                ref={(el) => (inputsRef.current[index] = el)}
              />
            ))}
          </div>
          {error && <p id="error-message" className="error">Incorrect code, please try again!</p>}
          <button id="submit-btn" onClick={handleSubmit}>Submit</button>
        </div>
         {/* ✅ Add Image Below */}
    <img 
        src={doggoSecurity} 
        alt="Doggo Security" 
        className="access-image"
    />
  </div>
  );
}

export default AdminAccess;
