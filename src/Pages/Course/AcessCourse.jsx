import { useEffect, useState } from "react";
import { Gear, Plus } from "react-bootstrap-icons";
import copppLogo from "../../assets/coppp.png";
import  axiosInstance  from '../../axios.jsx';
import styles from "./AccessCourse.module.css"; 
import { useNavigate } from "react-router-dom";
import { FiUpload } from "react-icons/fi";
import { FaTrash } from "react-icons/fa";

import toast from "react-hot-toast";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const navigate = useNavigate();

const handleAddCourse = (e) => {
  navigate("/add/Course", {state:{}})
};



  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axiosInstance.get("/api/course");
        setCourses(response.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
  
    fetchCourses();
  }, []);

  const handleDeleteCourse = async (courseId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this course?");
    if (!confirmDelete) return;
  
    try {
      const response = await axiosInstance.delete(`/api/course/${courseId}`);
      toast.success(response.data.message);
      setCourses((prev) => prev.filter((course) => course.course_id !== courseId));
    } catch (error) {
      console.error("Error deleting course:", error);
      alert("Failed to delete course.");
    }
  };
  

  return (
    <div className={styles.container}>
    <div className={styles.header}>
      <img src={copppLogo} alt="ACCESS Department Logo" className={styles.logo} />
      <div className={styles.headerText}>
        <h2 className={styles.title}>ACCESS DEPARTMENT</h2>
        <p className={styles.subtitle}>A Combination of Computer Experts and Special Students</p>
      </div>
      <button className={styles.addCourseButton}
      onClick={handleAddCourse} 
      >
        <Plus className="me-2" /> Add Course
      </button>
    </div>
  
    {/* Course List */}
    <div className={styles.courseCard} >
      {courses.length > 0 ? (
        courses.map((course, index) => (
          <div key={index} className={styles.courseItem} 
>
            <span className={styles.courseName}>{course.course_name}</span>
         
            <button
              onClick={() => navigate("/course/upload", { state: { courseId: course.course_id, courseName: course.course_name } })}
              className={styles.uploadcoursebtn} 
            >
              <FiUpload size={18} />
              Upload Schedules
            </button>
            <Gear size={20} 
            className={styles.icon}
            onClick={() => navigate(`/course/${course.course_id}/manage`)} 
            style={{ 
              cursor: "pointer",
             
              border: "2px", 
              borderRadius: "50%", 
              padding: "8px", 
              width: "40px", 
              height: "40px", 
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background-color 0.3s ease, border-color 0.3s ease"
            }} 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            />
          <FaTrash
            size={18}
            
            className={styles.trashIcon}
            style={{ marginLeft: "10px", cursor: "pointer" }}
            onClick={() => handleDeleteCourse(course.course_id)}
          />
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
