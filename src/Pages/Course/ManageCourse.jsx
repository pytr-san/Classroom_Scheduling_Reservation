import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import CreatableSelect from "react-select/creatable"; // ✅ Import react-select
import styles from "./ManageCourse.module.css";
import { FaArrowLeft,   FaSyncAlt } from "react-icons/fa"; // Font Awesome Icon

const ManageCourse = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [subjects, setSubjects] = useState([]);
  const [courseName, setCourseName] = useState("");
  const [faculty, setFaculty] = useState([]);
  const [updatedSubjects, setUpdatedSubjects] = useState({});

  useEffect(() => {
    axios.get(`http://localhost:8000/api/course/${id}/ManageCourse`)
      .then((response) => {
        setSubjects(response.data.subjects || []);
        setCourseName(response.data.course_name || "Unknown Course");
        setFaculty(response.data.faculty || []);
      })
      .catch((error) => console.error("Error fetching subjects:", error));
  }, [id]);

  const handleInstructorChange = (subject_id, facultyOption) => {
    setUpdatedSubjects((prev) => ({
      ...prev,
      [subject_id]: facultyOption?.value || null, // ✅ Store faculty_id
    }));
  };

  // ✅ Handle Adding New Instructor Automatically
  const handleCreateInstructor = (inputValue, subject_id) => {
    if (!inputValue.trim()) return;

    axios.post("http://localhost:8000/api/faculty/add", { name: inputValue })
      .then((response) => {
        const newFaculty = response.data.newFaculty;
        setFaculty([...faculty, newFaculty]); // ✅ Update UI with new instructor
        setUpdatedSubjects((prev) => ({
          ...prev,
          [subject_id]: newFaculty.faculty_id, // ✅ Assign new instructor
        }));
      })
      .catch((error) => console.error("Error adding instructor:", error));
  };

  const handleSaveChanges = () => {
    const updates = Object.entries(updatedSubjects)
      .filter(([subject_id, faculty_id]) => subject_id && faculty_id)
      .map(([subject_id, faculty_id]) => ({
        subject_id: parseInt(subject_id),
        faculty_id: parseInt(faculty_id),
      }));

    if (updates.length === 0) {
      alert("No changes to save.");
      return;
    }

    axios.put(`http://localhost:8000/api/course/${id}/ManageCourse/update`, { updates })
      .then(() => alert("Changes saved!"))
      .catch((error) => console.error("Error updating:", error));
  };

  const groupedSubjects = subjects.reduce((acc, subject) => {
    const { year_level, semester } = subject;
    const semesterLabel = semester === "1st" ? "First Semester" : "Second Semester";

    if (!acc[year_level]) acc[year_level] = { "First Semester": [], "Second Semester": [] };
    acc[year_level][semesterLabel].push(subject);
    return acc;
  }, {});

  const handleRefresh = () => {
    setUpdatedSubjects({}); // Clears the selected instructors
  };
  
  return (
    <div className={styles.container}>
      <div className={`${styles.header} d-flex justify-content-between align-items-center `}>
        <button className="btn btn-secondary  rounded " onClick={() => navigate(-1)}> 
        <FaArrowLeft size={20} className="me-1" /> Back</button>
        <h2 className={`${styles.title} flex-grow-1 text-center m-0`}>{courseName} - Manage Subjects and Instructors</h2>
        <button className="btn btn-secondary  rounded  d-flex align-items-center me-2" onClick={handleRefresh}>
          <FaSyncAlt size={20} className="me-1" /> Refresh
        </button>
        <button className={`btn btn-success  rounded  ms-auto ${styles.saveButton}`} onClick={handleSaveChanges}>
          Save & Update
        </button>
      </div>
  
      {Object.keys(groupedSubjects).sort((a, b) => a - b).map((year) => (
        <div key={year} className="mt-4">
          <h4 className="bg-secondary text-white p-2 fw-bold text-center">{year}</h4>
          {Object.entries(groupedSubjects[year]).map(([semester, subjects]) => (
            subjects.length > 0 && (
              <div key={semester} className="mt-3">
                <h5 className="fw-bold">{semester}</h5>
  
                <div className={styles.card}>
                  {subjects.map((subject) => (
                    <div key={subject.subject_id} className={styles.subjectRow}>
                      <span className="fw-semibold">{subject.subject_name}</span>
                      <div className="w-50">
                        <CreatableSelect
                          isClearable
                          value={
                            faculty
                              .map(f => ({ value: f.faculty_id, label: f.name }))
                              .find(option => option.value === (updatedSubjects[subject.subject_id] ?? subject.faculty_id)) || null
                          }
                          options={faculty.map(f => ({ value: f.faculty_id, label: f.name }))}
                          onChange={(selectedOption) => handleInstructorChange(subject.subject_id, selectedOption)}
                          onCreateOption={(inputValue) => handleCreateInstructor(inputValue, subject.subject_id)}
                          placeholder="Select or add instructor..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      ))}
    </div>
  );
};

export default ManageCourse;
