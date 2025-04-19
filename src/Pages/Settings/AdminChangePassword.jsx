import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../Hooks/useAuth";
import axios from "axios";
import './AdminChangePass.css';


const AdminChangePassword = () => {
    const { auth, setAuth } = useAuth();
    const navigate = useNavigate();
    
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
        
        if (formData.newPassword.length < 8) {
            setError("Password must be at least 8 characters long");
            return;
        }

        try {
            setIsLoading(true);
            const response = await axios.put('/auth/change-password', 
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
            
            setSuccess(true);
            // Optionally log out user after password change
            // setAuth({});
            // navigate('/login');
        } catch (err) {
            if (!err?.response) {
                setError('No Server Response');
            } else if (err.response?.status === 401) {
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
                &larr; Back to Settings
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
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        required
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="newPassword">New Password</label>
                    <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        required
                        minLength="8"
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="confirmNewPassword">Confirm New Password</label>
                    <input
                        type="password"
                        id="confirmNewPassword"
                        name="confirmNewPassword"
                        value={formData.confirmNewPassword}
                        onChange={handleChange}
                        required
                        minLength="8"
                    />
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