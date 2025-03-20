import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./Header.css"
import spistlogo from "../assets/logo1.png";

function Header({ toggleSidebar }) {

  return (
  <>
    <nav className="navbar navbar-expand-lg navbar-light bg-light px-3">
      <button 
        className="btn btn-light me-3" 
        onClick={toggleSidebar} // Calls function from parent component
      >
        <i className="bi bi-list" style={{ fontSize: "1.5rem" }}></i>
      </button>
      <img src={spistlogo} alt="spist logo" className="img-icon me-3" />
      <a className="navbar-brand" href="#">
        Southern Philippines Institute of Science and Technology
      </a>
    </nav>
  </>
  );
}

export default Header;
