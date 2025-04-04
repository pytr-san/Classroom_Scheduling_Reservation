
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import CreatableSelect from "react-select/creatable"; // ✅ Import react-select
import styles from "./ManageCourse.module.css";
import { FaArrowLeft, FaSyncAlt, FaCheck, FaTimes } from "react-icons/fa"; // Font Awesome Icon
import ConfirmModal from "../../components/Modal/ConfirmInstructor";
import useAuth from "../../Hooks/useAuth";

const ManageCourse = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [subjects, setSubjects] = useState([]);
  const [courseName, setCourseName] = useState("");
  const [faculty, setFaculty] = useState([]);
  const [updatedSubjects, setUpdatedSubjects] = useState({});
  const [pendingInstructor, setPendingInstructor] = useState(null);
  const { auth } = useAuth();
  const [inputValues, setInputValues] = useState({});


  const [showModal, setShowModal] = useState(false);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false)
    handleCancelInstructor();
  };

  useEffect(() => {
    axios.get(`http://localhost:8000/api/course/${id}/manage`, {withCredentials: true, }) // ✅ Ensure cookies (token) are sent
      .then((response) => {
        console.log("Subject list:",response.data)
        setSubjects(response.data.subjects || []);
        setCourseName(response.data.course_name || "Unknown Course");
        setFaculty(response.data.faculty || []);
      })
      .catch((error) => console.error("Error fetching subjects:", error));
  }, [id]);


  const handleInstructorChange = (subject_id, facultyOption) => {
    if (facultyOption?.__isNew__) {
       // Show check button if user starts typing a new instructor
      setPendingInstructor({ name: facultyOption.value, subject_id });
      setInputValues((prev) => ({ ...prev, [subject_id]: facultyOption.value })); // Keep text in input
    } else {
      // Reset if an existing instructor is selected or cleared
      setPendingInstructor(null);
      setUpdatedSubjects((prev) => ({
        ...prev,
        [subject_id]: facultyOption?.value || null,  // Save the selected faculty_id
      }));
      setInputValues((prev) => ({ ...prev, [subject_id]: "" })); // Reset input only for this subject
    }
  };
  
  const handleCancelInstructor = () => {
    setPendingInstructor(null);
    setInputValues("");
  };
  
  const handleConfirmInstructor = async () => {
    if (!pendingInstructor) return;
  
    const { name, subject_id } = pendingInstructor;
  
    try {
      // Add the instructor to the faculty and assign them to the subject
      const { data } = await axios.post("http://localhost:8000/api/faculty/add", { name, subject_id }, { withCredentials: true });
  
      const newFaculty = data.newFaculty; // The newly added instructor
  
      // Update the faculty state to reflect the newly added instructor
      setFaculty((prevFaculty) => [...prevFaculty, newFaculty]);
  
      // Update the subjects state to reflect the new instructor assignment
      setSubjects((prevSubjects) => prevSubjects.map(subject => 
        subject.subject_id === subject_id ? 
        { ...subject, faculty_id: newFaculty.faculty_id } : subject
      ));
  
      // Update the updatedSubjects state
      setUpdatedSubjects((prevSubjects) => ({
        ...prevSubjects,
        [subject_id]: newFaculty.faculty_id, // Associate the faculty_id with the subject_id
      }));
  
      // Reset pending instructor and close the modal
      setPendingInstructor(null);
      handleCloseModal();
    } catch (error) {
      console.error("Error adding instructor:", error);
    }
  };

  const handleInputChange = (value, actionMeta, subject_id) => {
    if (actionMeta.action === "input-change") {
      setInputValues((prev) => ({ ...prev, [subject_id]: value }));
  
      if (value.trim() !== "") {
        setPendingInstructor({ name: value, subject_id });
      } else {
        setPendingInstructor(null);
      }
    }
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
  
    axios.put(`http://localhost:8000/api/course/${id}/manage/update`, { updates }, { withCredentials: true })
      .then(() => {
        alert("Changes saved!");
        
        // Fetch the updated subjects and faculty data
        axios.get(`http://localhost:8000/api/course/${id}/manage`, { withCredentials: true })
          .then((response) => {
            // Update state with refreshed data
            setSubjects(response.data.subjects || []);
            setFaculty(response.data.faculty || []);
            setUpdatedSubjects({});  // Reset the updated subjects state after saving
          })
          .catch((error) => console.error("Error fetching refreshed subjects:", error));
      })
      .catch((error) => console.error("Error updating:", error));
  };
  
  // Group the subjects by year level and semester
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
                      <div className="w-50 d-flex align-items-center">
                          <CreatableSelect
                            className="flex-grow-1"
                            isClearable
                           // inputValue={inputValues[subject.subject_id] || ""} // Track input per subject
                            onInputChange={(value, actionMeta) => handleInputChange(value, actionMeta, subject.subject_id)}
                            // value={inputValues[subject.subject_id] || ""} // Make sure input stays controlled
                            value={
                              faculty
                                .map(f => ({ value: f.faculty_id, label: f.name }))
                                .find(option => option.value === (updatedSubjects[subject.subject_id] ?? subject.faculty_id)) || null
                            }
                            options={faculty.map(f => ({ value: f.faculty_id, label: f.name }))}
                            onChange={(selectedOption) => handleInstructorChange(subject.subject_id, selectedOption)}
                            placeholder="Select or add instructor..."
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault(); // Prevent form submission or input clearing
                                if (pendingInstructor) {
                                  handleShowModal(); // Trigger modal if enter is pressed
                                }
                              }
                            }}
                          />

                            {/* ✅ Show check and cancel buttons when user is typing a new instructor */}
                            {pendingInstructor && pendingInstructor.subject_id === subject.subject_id && (
                              <>
                                <button className="btn btn-success btn-sm ms-2" onClick={handleShowModal}>
                                  <FaCheck />
                                </button>
                                <button className="btn btn-danger btn-sm ms-2" onClick={handleCancelInstructor}>
                                  <FaTimes />
                                </button>
                              </>
                          )}
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      ))}
       {/* CONFIRM MODAL */}
       <ConfirmModal
        show={showModal}
        onHide={handleCloseModal}
        onConfirm={handleConfirmInstructor}
        instructorName={pendingInstructor?.name}
      />
    </div>
  );
};

export default ManageCourse;
