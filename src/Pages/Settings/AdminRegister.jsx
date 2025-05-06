import React, { useState } from 'react';
import  axiosInstance  from '../../axios.jsx';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import "./AdminRegister.css";

const AdminRegister = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin'
  });

  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      const response = await axiosInstance.post('/api/register-admin', formData);

      console.log(response.data.message);
      toast.success(response.data.message);

    } catch (err) {
      console.error(err);
      const message = err.response?.data?.message || "Registration failed.";
      setErrorMessage(message);
      toast.error(message); // error toast
    }
  };

  return (
    <div className="register-container" style={{ maxWidth: '400px', margin: 'auto', padding: '20px' }}>
      <h2>Admin Registration</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group" style={{ marginBottom: '15px' }}>
          <label>Name</label>
          <input 
            type="text" 
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '15px' }}>
          <label>Email</label>
          <input 
            type="email" 
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '15px' }}>
          <label>Password</label>
          <input 
            type="password" 
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength="6"
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        {errorMessage && (
          <p style={{ color: 'red', marginBottom: '10px' }}>{errorMessage}</p>
        )}

        <button 
          type="submit" 
          style={{ width: '100%', padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none' }}
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default AdminRegister;
