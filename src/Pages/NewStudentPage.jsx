import { useLocation } from "react-router-dom";

const NewStudentPage = () => {
    const location = useLocation();
    const { user } = location.state || {};  // Access the user data passed via state

    return (
        <div>
            <h1>Welcome, {user?.name}! Please select your details below</h1>
            <p>{user?.email }</p>
            {/* Render other user details */}
        </div>
    )   
}

export default NewStudentPage;