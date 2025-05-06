import React, { useState,useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"; 
import "./AdminAccess.css"; 
import  axiosInstance  from './../axios.jsx';
import bgAccess from "../assets/bghomepage.jpg";

function AdminAccess({onAccessGranted }) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState(false);
  const inputsRef = useRef([]);


  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);
  
  const handleInputChange = async (index, value) => {
    if (/^[0-9]?$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      if (value !== "" && index < 5) {
        inputsRef.current[index + 1].focus();
      }

      // Auto-submit if all digits are entered
      if (index === 5 || newCode.every(digit => digit !== "")) {
        const accessCode = newCode.join("");
        if (accessCode.length === 6) {
          await handleSubmit(accessCode);
        }
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleSubmit = async (accessCode) => {
    try {
      const response = await axiosInstance.post("/api/verify-pin",{ pin: accessCode });
      if (response.data.success) {
        onAccessGranted();
      } else {
        setError(true);
        setCode(["", "", "", "", "", ""]);
        inputsRef.current[0].focus();
      }
    } catch (error) {
      setError(true);
      setCode(["", "", "", "", "", ""]);
      inputsRef.current[0].focus();
    }
  };

  return (
    <div className="access-container"
    style={{
      background: "linear-gradient(135deg, black, #003300)",
    }}
    // style={{ backgroundImage: `url(${bgAccess})` }}
    >
        <div className="access-code-box">
          <h3>ENTER ACCESS CODE:</h3>
          <div className="code-inputs">
            {code.map((num, index) => (
              <input
                key={index}
                type="password" 
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
        </div>
  </div>
  );
}

export default AdminAccess;
