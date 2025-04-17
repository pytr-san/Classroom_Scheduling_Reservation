
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import CreatableSelect from "react-select/creatable"; // ✅ Import react-select
import styles from "./ManageCourse.module.css";
import { FaTrash , FaArrowLeft, FaSyncAlt, FaCheck, FaTimes } from "react-icons/fa"; // Font Awesome Icon
import ConfirmModal from "../../components/Modal/ConfirmInstructor";
import AddInstructorModal from "../../components/Modal/AddInstructorModal";
import useAuth from "../../Hooks/useAuth";
import toast from 'react-hot-toast';

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

  const [showAddInstructorModal, setShowAddInstructorModal] = useState(false); 
  const handleShowAddInstructorModal = () => setShowAddInstructorModal(true);
  const handleCloseAddInstructorModal = () => setShowAddInstructorModal(false);

  const [showModal, setShowModal] = useState(false);

  const handleShowModal = () => setShowModal(true);  
  const handleCloseModal = () => {
    setShowModal(false)
    handleCancelInstructor();
  };

  const addInstructor = async (instructorName) => {
    try {
      await axios.post("http://localhost:8000/api/add", { name: instructorName }, { withCredentials: true });

      await axios.get(`http://localhost:8000/api/course/${id}/manage`, {withCredentials: true, }) 
      .then((response) => {
        console.log("Subject list:",response.data)
        setSubjects(response.data.subjects || []);
        setCourseName(response.data.course_name || "Unknown Course");
        setFaculty(response.data.faculty || []);
      })
      .catch((error) => console.error("Error fetching subjects:", error));

      toast.success("Instructor added successfully!");
    } catch (error) {
      toast.error("Failed to add instructor.");
      throw error.response?.data?.error || "Error adding instructor.";
    }
  };

  useEffect(() => {
    axios.get(`http://localhost:8000/api/course/${id}/manage`, {withCredentials: true, }) 
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
      handleShowModal();
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
  
      const newFaculty = data.newFaculty;
  
      setFaculty((prevFaculty) => [...prevFaculty, newFaculty]);
  
      setSubjects((prevSubjects) => prevSubjects.map(subject => 
        subject.subject_id === subject_id ? 
        { ...subject, faculty_id: newFaculty.faculty_id } : subject
      ));

      setUpdatedSubjects((prevSubjects) => ({
        ...prevSubjects,
        [subject_id]: newFaculty.faculty_id, 
      }));
  
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
    setPendingInstructor(null);
  };

  const handleSubjectFieldChange = (subject_id, field, value) => {
    setSubjects(prevSubjects =>
      prevSubjects.map(subject =>
        subject.subject_id === subject_id
          ? { ...subject, [field]: value }
          : subject
      )
    );
  };
  const handleSaveSubjectNames = async () => {
    try {
      const updatedNames = subjects.map(({ subject_id, subject_name }) => ({
        subject_id,
        subject_name,
      }));
  
      await axios.put(`http://localhost:8000/api/course/${id}/subjects/update-names`, updatedNames, {
        withCredentials: true,
      });
  
      toast.success("Successfully updated!");
    } catch (err) {
      toast.error("Failed to update subject names.");
      console.error(err);
    }
  };
    
  const handleDeleteSubject = async (subject_id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this subject?");
  if (!confirmDelete) return; // Exit early if user cancels

    try {
      // Make API request to delete the subject
      await axios.delete(`http://localhost:8000/api/course/${id}/${subject_id}`, { withCredentials: true });
  
      // Remove the deleted subject from the state to update the UI
      setSubjects(prevSubjects => prevSubjects.filter(subject => subject.subject_id !== subject_id));
  
      toast.success("Subject deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete subject.");
      console.error("Error deleting subject:", error);
    }
  };
  
  return (
    <div className={styles.container}>
      <div className={`${styles.header} d-flex justify-content-between align-items-center `}>
        <button className="btn btn-secondary  rounded " onClick={() => navigate(-1)}> 
        <FaArrowLeft size={20} className="me-1" /> Back</button>
        <h2 className={`${styles.title} flex-grow-1 text-center m-0`}>{courseName}</h2>
        <button className="btn btn-secondary  rounded  d-flex align-items-center me-2" onClick={handleRefresh}>
          <FaSyncAlt size={20} className="me-1" /> Refresh
        </button>
        <div className="d-flex gap-2">
          <button
            className={`${styles.buttonAdd}`}
            onClick={handleShowAddInstructorModal}
          >
            Add Instructors
          </button>
          <button
            className={`${styles.buttonSmall}`}
            onClick={handleSaveChanges}
          >
            Save Instructors
          </button>
          <button
            className={`${styles.buttonSmall}`}
            onClick={handleSaveSubjectNames}
          >
            Save Subjects
          </button>

        </div>

      </div>
  
      {Object.keys(groupedSubjects).sort((a, b) => a - b).map((year) => (
        <div key={year} className="mt-4">
          <h4 className={styles.yearHeader}>{year}</h4>
          {Object.entries(groupedSubjects[year]).map(([semester, subjects]) => (
            subjects.length > 0 && (
              <div key={semester} className="mt-3">
                <h5 className="fw-bold">{semester}</h5>
  
                <div className={styles.card}>
                  {subjects.map((subject) => (
                    <div key={subject.subject_id} className={styles.subjectRow}>
                      <input
                        type="text"
                        className="form-control me-1 "
                        value={subject.subject_name}
                        onChange={(e) =>
                          handleSubjectFieldChange(subject.subject_id, "subject_name", e.target.value)
                        }
                        style={{
                          width: "350px",     
                          fontSize: "14px",    
                          padding: "8px",      
                        }}
                      />
                      <button 
                        className="btn btn-danger btn-sm "
                        onClick={() => handleDeleteSubject(subject.subject_id)}  // Trigger delete on click
                        aria-label="Delete Subject"  // Accessibility improvement
                      >
                        <FaTrash />
                      </button>
                      <div className="w-50 d-flex align-items-center ms-3">
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

      <AddInstructorModal
        show={showAddInstructorModal}
        onHide={handleCloseAddInstructorModal}
        onConfirm={addInstructor} // Pass the function to confirm adding an instructor
      />
    </div>
  );
};

export default ManageCourse;
