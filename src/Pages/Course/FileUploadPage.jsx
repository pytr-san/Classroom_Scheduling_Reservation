import { useLocation } from 'react-router-dom';
import BulkUploader from '../../components/BulkUploader';
import styles from "./Course.module.css";
import copppLogo from "../../assets/coppp.png";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useEffect } from 'react';

const FileUploadPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { courseId, courseName } = location.state || {};

  useEffect(() => {
    if (!courseId || !courseName) {
      navigate('/course'); 
    }
  }, [courseId, courseName, navigate]);
  
  if (!courseId || !courseName) return null;

  return (
    <div className={styles.container}>
      
      <div className={styles.header}>
      <div className="d-flex justify-content-start ">
                    <Button variant="outline-secondary" className="" onClick={() => navigate(-1)}>
                        <i className="bi bi-arrow-left fs-6"></i>
                    </Button>
                </div>
        <img src={copppLogo} alt="ACCESS Department Logo" className={styles.logo} />
        <div className={styles.headerText}>
          <h2 className={styles.title}>ACCESS DEPARTMENT</h2>
          <p className={styles.subtitle}>A Combination of Computer Experts and Special Students</p>
        </div>
      </div>
      <div className={styles.upload}>
      <h2>Upload Schedules for {courseName}</h2>
        <BulkUploader courseId={courseId} />

      </div>
    </div>
  );
};

export default FileUploadPage;
