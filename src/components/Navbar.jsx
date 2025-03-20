
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./Navbar.css"; // External CSS file
//import spistlogo from "../assets/logo1.png"
import accesslogo from "../assets/coppp.png"
import { Link } from "react-router-dom";

function Navbar({ isSidebarOpen }) {



  return (
    <>
       {/* Navbar */}
       {/* <nav className="navbar navbar-expand-lg navbar-light bg-light px-3">
        <button 
          className="btn btn-light me-3" 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <i className="bi bi-list" style={{ fontSize: "1.5rem"}}></i>
        </button>
        <img src={spistlogo} alt="spist logo" className="img-icon me-3" />
        <a className="navbar-brand" href="#">Southern Philippines Institute of Science and Technology</a>
      </nav> */}

      {/* Sidebar */}
      <div
        className={`sidebar bg-light ${isSidebarOpen ? "open" : "closed"}`} 
        onMouseEnter={() => setIsSidebarOpen(true)}
        onMouseLeave={() => setIsSidebarOpen(false)}
      >
        <nav className="nav flex-column p-3">
          <Link className="nav-link" to = 'Home'><img src={accesslogo} alt="access logo" className="logo me-2" /> <span>Home</span></Link>
          <Link className="nav-link" to = 'classroom'><i className="bi bi-people me-2"></i> <span>Classroom</span></Link>
          <Link className="nav-link" to = 'course'><i className="bi bi-book me-2"></i> <span>Course</span></Link>
          <Link className="nav-link" to = 'settings'><i className="bi bi-gear me-2"></i> <span>Settings</span></Link>
        </nav>
      </div>
    </>
  );
}

export default Navbar;
