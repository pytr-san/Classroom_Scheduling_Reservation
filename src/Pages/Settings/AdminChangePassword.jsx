import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../Hooks/useAuth";
import  axiosInstance  from '../../axios.jsx';
import './AdminChangePass.css';
import toast from "react-hot-toast";
import { FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";

const AdminChangePassword = () => {
    const { auth, setAuth } = useAuth();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showReTypePassword, setShowReTypePassword] = useState(false);

    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        // Validate form
        if (formData.newPassword !== formData.confirmNewPassword) {
            setError("New passwords don't match");
            return;
        }
        
        if (formData.newPassword.length < 16) {
            setError("Password must be at least 16 characters long");
            return;
        }

        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_])[A-Za-z\d!@#$%^&*(),.?":{}|<>_]{16,}$/;

        if (!passwordRegex.test(formData.newPassword)) {
            setError("Password must contain at least one uppercase letter, one number, and one special character.");
            return;
        }
        try {
            setIsLoading(true);
            const response = await axiosInstance.put('/auth/change-password', 
                {
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                },
                {
                    headers: {
                        'Authorization': `Bearer ${auth?.accessToken}`
                    }
                }
            );
            toast.success("Password changed successfully!");
            setFormData({
                currentPassword: '',
                newPassword: '',
                confirmNewPassword: ''
              });
              
            setSuccess(true);

        } catch (err) {
            if (!err?.response) {
                setError('No Server Response');
            } else if (err.response?.status === 401) {
                toast.error("Incorrect Password! Try again.");
                setError('Current password is incorrect');
            } else {
                
                setError('Password change failed');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="change-password-container">
            <button onClick={() => navigate(-1)} className="back-button">
            <FaArrowLeft size={20} className="me-1" /> Back to Settings
            </button>
            
            <h2>🔑 Password Change</h2>
            <p>For security reasons, please enter your current password and then your new password twice.</p>
            
            {error && <div className="error-message">{error}</div>}
            {success && (
                <div className="success-message">
                    Password changed successfully!
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="password-form">
                <div className="form-group">
                    <label htmlFor="currentPassword">Current Password</label>
                    <input
                        type={showCurrentPassword ? "text" : "password"}
                        id="currentPassword"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        required
                    />
                     <span
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="eyeToggleshow"
                    >
                        {showCurrentPassword ?  <FaEye /> : <FaEyeSlash />}
                     </span>
                </div>
                
                <div className="form-group">
                    <label htmlFor="newPassword">New Password</label>
                    <input
                        type={showPassword ? "text" : "password"}
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        required
                        minLength="16"
                    />
                    <span
                        onClick={() => setShowPassword(!showPassword)}
                        className="eyeToggleshow"
                    >
                        {showPassword ?  <FaEye /> : <FaEyeSlash />}
                    </span>
                </div>
                
                <div className="form-group">
                    <label htmlFor="confirmNewPassword">Confirm New Password</label>
                    <input
                        type={showReTypePassword ? "text" : "password"}
                        id="confirmNewPassword"
                        name="confirmNewPassword"
                        value={formData.confirmNewPassword}
                        onChange={handleChange}
                        required
                        minLength="16"
                    />
                     <span
                        onClick={() => setShowReTypePassword(!showReTypePassword)}
                        className="eyeToggleshow"
                    >
                        {showReTypePassword ? <FaEye /> : <FaEyeSlash />}
                    </span>
                </div>
                
                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="submit-button"
                >
                    {isLoading ? 'Processing...' : 'Change Password'}
                </button>
            </form>
        </div>
    );
};

export default AdminChangePassword;