import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PrivacyPolicy.module.css';  // You can customize the CSS according to your style

const PrivacyPolicy = () => {
    const navigate = useNavigate();

    const handleAccept = () => {
        // Logic when the user accepts the Privacy Policy, such as setting a flag in local storage or redirecting
        localStorage.setItem('privacyAccepted', 'true');
        navigate('/dashboard');  // Redirect to another page, like the dashboard or home page
    };

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <h1 className={styles.title}>Privacy Policy</h1>

                <p className={styles.intro}>
                    Your privacy is important to us. Please read the following policy carefully to understand how we collect,
                    use, and protect your personal information.
                </p>

                <h2 className={styles.heading}>1. Information We Collect</h2>
                <p>
                    We may collect the following types of information:
                    <ul>
                        <li>Personal Information: Name, email address, and other registration details.</li>
                        <li>Usage Data: Information about how you interact with the system, including IP address, browser type, etc.</li>
                    </ul>
                </p>

                <h2 className={styles.heading}>2. How We Use Your Information</h2>
                <p>
                    The information we collect is used for the following purposes:
                    <ul>
                        <li>To create and manage your user account.</li>
                        <li>To improve the system's functionality and performance.</li>
                        <li>To comply with legal obligations or requests.</li>
                    </ul>
                </p>

                <h2 className={styles.heading}>3. Data Security</h2>
                <p>
                    We implement reasonable security measures to protect your data from unauthorized access, disclosure, alteration, or destruction.
                </p>

                <h2 className={styles.heading}>4. Sharing Your Information</h2>
                <p>
                    We will not share your personal information with third parties except in the following cases:
                    <ul>
                        <li>With your consent.</li>
                        <li>If required by law.</li>
                    </ul>
                </p>

                <h2 className={styles.heading}>5. Cookies and Tracking Technologies</h2>
                <p>
                    We may use cookies to improve system performance and user experience. Currently, cookies are primarily used for session management and login functionality.
                </p>

                <h2 className={styles.heading}>6. Data Retention</h2>
                <p>
                    We retain your personal information only for as long as necessary, unless a longer retention period is required by law.
                </p>

                <h2 className={styles.heading}>7. Account Deletion</h2>
                <p>
                    You can request to delete your account at any time. Upon deletion, your data will be removed from our systems, except where legally required to retain it.
                </p>

                <h2 className={styles.heading}>8. Your Rights</h2>
                <p>
                    You have the right to access, correct, or delete your personal information as detailed in the policy.
                </p>

                <h2 className={styles.heading}>9. Changes to This Policy</h2>
                <p>
                    We may update this Privacy Policy from time to time. Changes will be communicated, and the updated policy will be effective as indicated.
                </p>

                <h2 className={styles.heading}>10. Contact Us</h2>
                <p>
                    If you have any questions, feel free to contact us at <strong>your-email@example.com</strong>.
                </p>

                <div className={styles.acceptSection}>
                    <p>
                        By using this system, you agree to the terms and conditions outlined in this Privacy Policy.
                    </p>
                    <button className={styles.acceptButton} onClick={handleAccept}>
                        Accept
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
