import { useEffect, useState } from "react";
import { Gear, Plus } from "react-bootstrap-icons";
import copppLogo from "../../assets/coppp.png";
import axios from "axios";
import styles from "./Course.module.css"; // Import CSS module
import { useNavigate } from "react-router-dom";

const Courses = () => {
  const [courses, setCourses] = useState([]);

  const navigate = useNavigate();
  useEffect(() => {
    axios.get("http://localhost:8000/api/course")
      .then((response) => {
        console.log("Courses API Response:", response.data); // Debug
        setCourses(response.data);
      })
      .catch((error) => {
        console.error("Error fetching courses:", error);
      });
  }, []);

  return (
    <div className={styles.container}>
    <div className={styles.header}>
      <img src={copppLogo} alt="ACCESS Department Logo" className={styles.logo} />
      <div className={styles.headerText}>
        <h2 className={styles.title}>ACCESS DEPARTMENT</h2>
        <p className={styles.subtitle}>A Combination of Computer Experts and Special Students</p>
      </div>
      <button className={styles.addCourseButton}>
        <Plus className="me-2" /> Add Course
      </button>
    </div>
  
    {/* Course List */}
    <div className={styles.courseCard}>
      {courses.length > 0 ? (
        courses.map((course, index) => (
          <div key={index} className={styles.courseItem}>
            <span className={styles.courseName}>{course.course_name}</span>
            <Gear size={20} 
            className={styles.icon}
            onClick={() => navigate(`/course/${course.course_id}/ManageCourse`)} 
            style={{ cursor: "pointer" }} />
          </div>
        ))
      ) : (
        <p className={styles.subtitle}>No courses available</p>
      )}
    </div>
  </div>
  );
};

export default Courses;
