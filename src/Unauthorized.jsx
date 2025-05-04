import React from "react";
import { useNavigate } from "react-router-dom";

const UnauthorizedPage = () => {
    const navigate = useNavigate();

    return (
        <div style={styles.container}>
            <h1 style={styles.code}>403</h1>
            <h2 style={styles.title}>Unauthorized Access</h2>
            <p style={styles.message}>
                You do not have permission to view this page.
            </p>
            <button style={styles.button} onClick={() => navigate(-1)}>
                Go Back
            </button>
        </div>
    );
};

const styles = {
    container: {
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        backgroundColor: "#f2f2f2",
        padding: "20px",
    },
    code: {
        fontSize: "72px",
        color: "#e74c3c",
        margin: "0",
    },
    title: {
        fontSize: "28px",
        margin: "10px 0",
    },
    message: {
        color: "#555",
        marginBottom: "20px",
    },
    button: {
        padding: "10px 20px",
        fontSize: "16px",
        backgroundColor: "#3498db",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
    },
};

export default UnauthorizedPage;
