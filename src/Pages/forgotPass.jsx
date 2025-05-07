import React, { useState } from 'react';
import axiosInstance from './../axios.jsx';  // Your axios instance
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast'; // For showing toast notifications
import './forgotpass.css';

const ForgotPass = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { token } = useParams();
  const navigate = useNavigate();

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/auth/forgot-password', { email });
      setMessage(response.data.message);
      setError('');
      toast.success(response.data.message);  // Show success toast
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'An error occurred while sending the reset email';
      setError(errorMessage);
      setMessage('');
      toast.error(errorMessage);  // Show error toast
      console.error('Forgot password request failed:', err.response?.data || err.message);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post(`/auth/reset-password/${token}`, { password });
      setMessage(response.data.message);
      setError('');
      toast.success(response.data.message);  // Show success toast
      setTimeout(() => navigate('/login'), 2000); // Redirect after 2 seconds
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'An error occurred while resetting the password';
      setError(errorMessage);
      setMessage('');
      toast.error(errorMessage);  // Show error toast
      console.error('Reset password request failed:', err.response?.data || err.message);
    }
  };

  return (
    <div className="forgotPassContainer">
    {token ? (
      <form onSubmit={handleResetPassword} className="forgotForm">
        <h2>Reset Password</h2>
        <div className="inputGroupFp">
          <label>New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Reset Password</button>
      </form>
    ) : (
      <form onSubmit={handleForgotPassword} className="forgotForm">
        <h2>Forgot Password</h2>
        <div className="inputGroupFp">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit">Send Reset Email</button>
      </form>
    )}
    {message && <p className="successMessage">{message}</p>}
    {error && <p className="errorMessage">{error}</p>}
  </div>
);
};

export default ForgotPass;
