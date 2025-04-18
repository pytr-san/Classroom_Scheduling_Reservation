import {  useState } from "react";
import toast from 'react-hot-toast';
import axios from "axios";
import "./CourseForm.css";
import { useNavigate } from "react-router-dom";
import { FaTrash , FaArrowLeft} from "react-icons/fa"; 

const CourseForm = () => {
    const navigate = useNavigate();
    const yearLevels = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

    const [courseName, setCourseName] = useState('');
    const [courseDescription, setCourseDescription] = useState('');
    const [currentYearIndex, setCurrentYearIndex] = useState(0);
    const [semesters, setSemesters] = useState([
      { name: '1st Semester', subjects: [{ name: "" }] },
      { name: '2nd Semester', subjects: [{ name: "" }] }
    ]);
    const [batches, setBatches] = useState([]);
    const [finalCourses, setFinalCourses] = useState([]);
    const [showBatchForm, setShowBatchForm] = useState(true);

    const handleSubjectChange = (semesterIndex, subjectIndex, field, value) => {
        if (field === 'name') {
          value = value.replace(/\b\w/g, (char) => char.toUpperCase());
        }
        const updated = [...semesters];
        updated[semesterIndex].subjects[subjectIndex][field] = value;
        setSemesters(updated);
      };
        
      const handleAddSubject = (semesterIndex) => {
        const updated = [...semesters];
        updated[semesterIndex].subjects.push({ name: "" });
        setSemesters(updated);
      };
      
      const handleRemoveSubject = (semesterIndex, subjectIndex) => {
        const updated = [...semesters];
        updated[semesterIndex].subjects.splice(subjectIndex, 1);
        setSemesters(updated);
      };
      
    const handleDone = () => {
        const isValidSubjects = semesters.every((sem) =>
          sem.subjects.every((sub) => sub.name.trim())
        );
      
        if (!isValidSubjects) {
          toast.error("Please fill all subject names.");
          return;   
        }
      
        // Store this year level into batches
        const yearBatch = {
          yearLevel: yearLevels[currentYearIndex],
          semesters: semesters,
        };
      
        setBatches((prev) => [...prev, yearBatch]);
      
        if (currentYearIndex < yearLevels.length - 1) {
          setCurrentYearIndex((prev) => prev + 1);
          setSemesters([
            { name: "1st Semester", subjects: [{ name: "" }] },
            { name: "2nd Semester", subjects: [{ name: "" }] },
          ]);
        } else {
          // Finalize course after 4th year
          const newCourse = {
            courseName,
            courseDescription,
            batches: [...batches, yearBatch],
          };
      
          setFinalCourses((prev) => [...prev, newCourse]);
          setCourseName("");
          setCourseDescription("");
          setBatches([]);
          setCurrentYearIndex(0);
          setSemesters([
            { name: "1st Semester", subjects: [{ name: "" }] },
            { name: "2nd Semester", subjects: [{ name: "" }] },
          ]);
          setShowBatchForm(false);
          toast.success("Course creation complete!");
        }
      };
   
      
const saveCourseToDB = async (course) => {
  try {
    // 1. Save course info (no course_id)
    const courseRes = await axios.post('http://localhost:8000/api/add/course', {
      course_name: course.courseName,
      description: course.courseDescription
    }, { withCredentials: true });

    const courseId = courseRes.data.course_id; // Get inserted ID

    // 2. Save each subject
    for (const batch of course.batches) {
      for (const semester of batch.semesters) {
        for (const subject of semester.subjects) {
          await axios.post('http://localhost:8000/api/subjects', {
            course_id: courseId,
            semester: semester.name,
            year_level: batch.yearLevel,
            subject_name: subject.name,
          }, { withCredentials: true });
        }
      }
    }

    toast.success("Course and subjects saved successfully!");
  } catch (err) {
    console.error(err);
    toast.error("Failed to save course.");
  }
};

    return (
    
        <div className="course-form-container">
            <div className={" d-flex   "}>
            <button className="btn btn-secondary  rounded " onClick={() => navigate(-1)}> 
            <FaArrowLeft size={20} className="me-0" /> Back</button>
            <h2 className={"m-2"}>ADD COURSE</h2>
            </div>
          {showBatchForm ? (
            <div>
              <label>
                Course Name:
                <input
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                />
              </label>
              <label>
                Course Description:
                <textarea
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                />
              </label>

              <h3>Year Level: {yearLevels[currentYearIndex]}</h3>

              {semesters.map((semester, semesterIndex) => (
                <div key={semesterIndex} className="semester-block">
                  <h2>{semester.name}</h2>
                  {semester.subjects.map((subject, subjectIndex) => (
                    <div key={subjectIndex} className="subject-block">
                        <div className="subject-input-group">
                            <label>
                            Subject Name:
                            <input
                                type="text"
                                value={subject.name}
                                onChange={(e) =>
                                handleSubjectChange(semesterIndex, subjectIndex, "name", e.target.value)
                                }
                            />
                            </label>
                            <button
                            type="button"
                            className="button3"
                            onClick={() => handleRemoveSubject(semesterIndex, subjectIndex)}
                            >
                            Remove
                            </button>
                        </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleAddSubject(semesterIndex)}
                    className="add-subject-button"
                    >
                      + Add
                    </button>
                </div>
              ))}

              <button type="button" className="button2" onClick={handleDone}>
                Done
              </button>
            </div>
          ) : (
            <div className="final-courses-container">
                {finalCourses.map((course, courseIndex) => (                 
                <div key={courseIndex} className="course-card">
                    <div className="course-header">
                    <div className="course-info">
                        <h3>Course Name: {course.courseName}</h3>
                        <p>Course Description: {course.courseDescription}</p>
                    </div>
                    <button
                        className="btnsave_course"
                        onClick={() => saveCourseToDB(finalCourses[finalCourses.length - 1])}
                    >
                        Save Course
                    </button>
                    </div>
                    {course.batches.map((batch, batchIndex) => (
                    <div key={batchIndex} className="year-section">
                        <h4>{batch.yearLevel}</h4>
                        {batch.semesters.map((semester, semesterIndex) => (
                        <div key={semesterIndex} className="semester-block2">
                            <h5>{semester.name}</h5>
                            {semester.subjects.map((subject, subjectIndex) => (
                            <div key={subjectIndex} className="subject-entry">
                                <p>Subject Name: {subject.name}</p>
                            </div>
                            ))}
                        </div>
                        ))}
                    </div>
                    ))}
                </div>
                ))}
            </div>
          )}
        </div>
    );
};

export default CourseForm;
