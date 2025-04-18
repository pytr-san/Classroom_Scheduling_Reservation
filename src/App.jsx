import Home from "./Pages/Home/Home.jsx";
import Classroom from "./Pages/Classroom/Classroom.jsx";
import Course from "./Pages/Course/Course.jsx";
import Settings from "./Pages/Settings/Settings.jsx";
import Register from "./Pages/Register.jsx";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./Pages/Login.jsx";
import ManageCourse from "./Pages/Course/ManageCourse.jsx";
import axios from "axios";
import Layout from "./components/Layout";
import RequireAuth from "./components/RequireAuth.jsx";
import UnauthorizedPage from "./Unauthorized.jsx";
import AdminAccess from "./components/AdminAccess.jsx";
import ClassSchedule from "./Pages/Home/ClassScheduleTemp.jsx";
import "bootstrap-icons/font/bootstrap-icons.css";
import ClassroomReservation from "./Pages/Classroom/ClassroomReservation.jsx";
import NewStudent from "./Pages/NewStudentPage.jsx";
import ScheduleTemp from "./Pages/Classroom/RoomScheduleTemp.jsx"
import CourseForm from "./Pages/Course/CourseForm.jsx"


const ROLES = {
  student: "student",
  admin: "admin",
  faculty: "faculty"
};

    function App() {
     

        return(
            
            <Routes>
           
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />               
                <Route path="/unauthorized" element={<UnauthorizedPage />} />
                <Route path="/register/newstudent" element={<NewStudent />} />  

                <Route path ="/" element={<Layout />}>
                    {/* Protected Routes (With Layout) */}
                    <Route element={<RequireAuth allowedRoles={[ROLES.admin, ROLES.student, ROLES.faculty]} />}> 
                            <Route path="/" element={<Home />} />                                                 
                            <Route path="/settings" element={<Settings />} />
                    </Route>

                    {/* Admin-Only Routes */}
                    <Route element={<RequireAuth allowedRoles={[ROLES.admin]} />}>
                            <Route path="/class-schedule/:course/:year/:section" element={<ClassSchedule />} />                           
                            <Route path="/create-room-schedule" element={<ScheduleTemp />} />

                            <Route path="/classroom" element={<Classroom />} />
                            <Route path="/classroom/reservation" element={<ClassroomReservation/>} />
                            
                            <Route path="/course" element={<Course />} />
                            <Route path="/add/course" element={<CourseForm />} />
                            <Route path="/course/:id/manage" element={<ManageCourse />} />
                                  
                    </Route>
                </Route>
                {/* Redirect unknown routes */}
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        )
    }

export default App
