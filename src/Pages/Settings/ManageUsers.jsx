import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./ManageUsers.module.css";
import { format } from 'date-fns';
import toast from "react-hot-toast";
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from "react-icons/fa";

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
      const response = await axios.get(`http://localhost:8000/api/users/${role}`, {
        withCredentials: true,
      });
      const mappedUsers = response.data.map((user) => ({
        ...user,
        id:
          role === "student"
            ? user.student_id
            : role === "faculty"
            ? user.faculty_id
            : user.admin_id,
        status: user.is_active ? "active" : "inactive", // also normalize status
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
      await axios.patch(`http://localhost:8000/api/users/${role}/${userId}/status`, {
        is_active: newStatus === "active" ? 1 : 0
      }, {
        withCredentials: true
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

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className={styles.container}>
      <button onClick={() => navigate(-1)} >
      <FaArrowLeft size={20} className="me-1" /> Back
      </button>

      <h2 className={styles.title}>Manage Users</h2>

      <div className={styles.searchContainer}>
      <select className={styles.dropdown} value={role} onChange={(e) => setRole(e.target.value)}  >
        <option value="student">Students</option>
        <option value="faculty">Faculty</option>
        <option value="admin">Admins</option>
      </select>
     
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
            <th>Toggle</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <tr key={user.id}> {/* Unique key prop */}
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
                <td>
                  <button
                    className={styles.toggleBtn}
                    onClick={() => handleToggleStatus(user.id, user.status)}
                  >
                    {user.status === "active" ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="4">No users found</td></tr>
          )}
        </tbody>

        {/* <tbody>
          {users.length > 0 ? (
            users.map((user) => (
              <tr key={user.id}>
                <td>{user.full_name}</td>
                <td>{user.email}</td>
                <td>{user.status}</td>
                <td>
                  <button
                    className={styles.toggleBtn}
                    onClick={() => handleToggleStatus(user.id, user.status)}
                  >
                    {user.status === "active" ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="4">No users found</td></tr>
          )}
        </tbody> */}
      </table>
    </div>
  );
};

export default ManageUsers;
