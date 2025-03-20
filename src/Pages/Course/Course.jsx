
import { useState } from "react";
import { Gear, Plus } from "react-bootstrap-icons";
import copppLogo from "../../assets/coppp.png";


const Courses = () => {
  const [courses, setCourses] = useState(["BSCPE", "BSCS", "BSIT"]);

  return (
    <div className="container text-center mt-5">
      {/* Header Section */}
      <div className="mb-4">
        <img
          src={copppLogo}// Replace with your actual logo path
          alt="ACCESS Department Logo"
          className="img-fluid rounded-circle"
          style={{ width: "120px", height: "120px" }}
        />
        <h2 className="mt-3 fw-bold">ACCESS DEPARTMENT</h2>
        <p className="text-muted">A Combination of Computer Experts and Special Students</p>
      </div>

      {/* Add Course Button */}
      <button className="btn btn-outline-dark d-flex align-items-center mx-auto mb-4">
        <Plus className="me-2" /> Add Course
      </button>

      {/* Course List */}
      <div className="card p-3 shadow-sm">
        {courses.map((course, index) => (
          <div
            key={index}
            className="d-flex justify-content-between align-items-center border-bottom py-2"
          >
            <span className="fw-semibold">{course}</span>
            <Gear size={20} className="text-secondary" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Courses;
