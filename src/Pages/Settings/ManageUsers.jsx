import { useEffect, useState } from "react";
import  axiosInstance  from '../../axios.jsx';
import styles from "./ManageUsers.module.css";
import { format } from 'date-fns';
import toast from "react-hot-toast";
import { useNavigate } from 'react-router-dom';
import { FaSearch } from "react-icons/fa";
import { Button } from "react-bootstrap";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [role, setRole] = useState("student");
  const [searchTerm, setSearchTerm] = useState(""); 
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers(role);
  }, [role]);

  const fetchUsers = async (role) => {
    try {
      const response = await axiosInstance.get(`/api/users/${role}`);
      const mappedUsers = response.data.map((user) => ({
        ...user,
        id: role === "student" ? user.student_id : role === "faculty" ? user.faculty_id : user.admin_id,
        status: user.is_active ? "active" : "inactive", // Normalize status
      }));
      setUsers(mappedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users.");
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    console.log("Toggling user ID:", userId, "to", newStatus);

    try {
      await axiosInstance.patch(`/api/users/${role}/${userId}/status`, {
        is_active: newStatus === "active" ? 1 : 0
      });

      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, status: newStatus } : user
        )
      );
      toast.success(`User ${newStatus === "active" ? "activated" : "deactivated"} successfully.`);
    } catch (error) {
      console.error("Status update error:", error);
      toast.error("Failed to update user status.");
    }
  };

  const handleResetAttempts = async (email,failedAttempts) => {
    if (failedAttempts === 0) {
      toast.error("No failed attempts to reset.");
      return;  // Exit the function if failed_attempts is 0
    }

    try {
      await axiosInstance.post("/api/reset-attempts", { email, role });
      toast.success("Login attempts reset successfully.");
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.email === email ? { ...user, failed_attempts: 0 } : user
        )
      );
    } catch (error) {
      console.error("Reset attempts error:", error);
      toast.error("Failed to reset login attempts.");
    }
  };
 
  const filteredUsers = users.filter(
    (user) => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
      
  );

  return (
    <div className={styles.container}>

      <Button variant="outline-secondary" 
        className="px-4"
       style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }} 
        onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left fs-5"></i>
      </Button>

      <h2 className={styles.title}>Manage Users</h2>

      <div className={styles.searchContainer}>
        <select className={styles.dropdown} value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="student">Students</option>
          <option value="faculty">Faculty</option>
          <option value="admin">Admins</option>
        </select>
        
        <FaSearch className={styles.searchIcon} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search by name or email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <table className={styles.userTable}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Last Active</th>
            <th>Login Failed Attempts</th>
            <th>Toggle</th>
            <th>Reset</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.status}</td>
                <td>
                  {new Intl.DateTimeFormat('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric',
                    hour12: true,
                  }).format(new Date(user.last_active))}
                </td>
                <td>{user.failed_attempts}</td>
                <td>
                  <button
                    className={`${styles.toggleBtn} ${user.status === "active" ? styles.deactivateBtn : styles.activateBtn}`}
                    onClick={() => handleToggleStatus(user.id, user.status)}
                  >
                    {user.status === "active" ? "Deactivate" : "Activate"}
                  </button>
                </td>
                <td>
                <button
                  className={styles.resetBtn}
                  onClick={() => handleResetAttempts(user.email, user.failed_attempts)}
                >
                  Reset
                </button>
              </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="5">No users found</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ManageUsers;
