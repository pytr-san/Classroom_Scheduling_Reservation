import { Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";

import Home from "./Pages/Home/Home.jsx";
import Classroom from "./Pages/Classroom/Classroom.jsx";
import Course from "./Pages/Course/Course.jsx";
import Settings from "./Pages/Settings/Settings.jsx";
import Register from "./Pages/Register.jsx";
import Login from "./Pages/Login.jsx";
import ManageCourse from "./Pages/Course/ManageCourse.jsx";
import Layout from "./components/Layout";
import RequireAuth from "./components/RequireAuth.jsx";
import UnauthorizedPage from "./Unauthorized.jsx";
import ClassSchedule from "./Pages/Home/ClassScheduleTemp.jsx";
import ClassroomReservation from "./Pages/Classroom/ClassroomReservation.jsx";
import NewStudent from "./Pages/NewStudentPage.jsx";
import AdminChangePassword from "./Pages/Settings/AdminChangePassword.jsx";
import "bootstrap-icons/font/bootstrap-icons.css";

axios.defaults.withCredentials = true;

const ROLES = {
  student: "student",
  admin: "admin",
  faculty: "faculty",
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/register/newstudent" element={<NewStudent />} />

      {/* Protected Routes with Layout */}
      <Route path="/" element={<Layout />}>
        {/* Accessible to all authenticated users */}
        <Route
          element={
            <RequireAuth
              allowedRoles={[ROLES.admin, ROLES.student, ROLES.faculty]}
            />
          }
        >
          <Route index element={<Home />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin/change-password" element={<AdminChangePassword />}/>
        </Route>

        {/* Admin-only Routes */}
        <Route element={<RequireAuth allowedRoles={[ROLES.admin]} />}>
          <Route
            path="/class-schedule/:course/:year/:section"
            element={<ClassSchedule />}
          />
          <Route
            path="/classroom/reservation"
            element={<ClassroomReservation />}
          />
          <Route path="/classroom" element={<Classroom />} />
          <Route path="/course" element={<Course />} />
          <Route path="/course/:id/manage" element={<ManageCourse />} />
        </Route>
      </Route>

      {}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
