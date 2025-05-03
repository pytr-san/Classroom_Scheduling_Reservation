import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './FacultyDashboard.module.css';
import { formatDistanceToNow, format, isToday, isYesterday, parseISO } from 'date-fns';

const groupFilesByDate = (files) => {
  return files.reduce((groups, file) => {
    const date = parseISO(file.created_at);
    let dateLabel = format(date, 'MMMM dd, yyyy');

    if (isToday(date)) dateLabel = 'Today';
    else if (isYesterday(date)) dateLabel = 'Yesterday';

    if (!groups[dateLabel]) {
      groups[dateLabel] = [];
    }
    groups[dateLabel].push(file);

    return groups;
  }, {});
};

const FacultyFiles = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/view-files', {
          withCredentials: true,
        });
        setFiles(response.data);
      } catch (err) {
        setError('Error fetching files.');
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);
  

  
  
  const groupedFiles = groupFilesByDate(files);


  if (loading) return <div className={styles.container}>Loading files...</div>;
  if (error) return <div className={styles.container}>{error}</div>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Access Course Schedules</h2>
      {files.length === 0 ? (
        <p>No files found.</p>
      ) : (
        Object.entries(groupedFiles).map(([date, filesOnDate]) => (
          <div key={date}>
            <h3 className={styles.dateHeading}>{date}</h3>
            <ul className={styles.fileList}>
              {filesOnDate.map((file, index) => {

                return (
                  <li key={index} className={styles.fileItem}>
                    {/* PDF preview */}
                    <div className={styles.pdfViewerContainer}>
                      <iframe
                        className={styles.pdfViewer}
                        src={file.fileUrl.replace(/\\/g, '/')}
                        width="100%"
                        height="400"
                        title={file.filename}
                      />
                    </div>

                    {/* Download link */}
                    <a
                    href={file.fileUrl.replace(/\\/g, '/')}
                    className={styles.downloadLink}
                    download
                  >
                   View {file.filename}
                  </a>

                    <span className={styles.courseLabel}>
                      <strong> 📘 Course: </strong> {file.description}{' '}
                      <strong>({file.course_name || 'Unknown'})</strong>
                      <br />
                      🕒 Uploaded {formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))
      )}
    </div>
  );
};

export default FacultyFiles;
