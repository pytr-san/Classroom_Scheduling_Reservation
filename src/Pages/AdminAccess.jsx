import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom"; 
import "./Admin.css"; 

function AdminAccess() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState(false);
  const inputsRef = useRef([]);

  const navigate = useNavigate();

  
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

  const handleSubmit = () => {
    const accessCode = code.join("");
    if (accessCode === "123456") { 
      navigate("/classroom"); 
    } else {
      setError(true);
      setCode(["", "", "", "", "", ""]);
      inputsRef.current[0].focus();
    }
  };

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
    </div>
  );
}

export default AdminAccess;
