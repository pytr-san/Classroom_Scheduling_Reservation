import { useLocation } from "react-router-dom";

const NewStudentPage = () => {
    const location = useLocation();
    const { user } = location.state || {};  // Access the user data passed via state

    return (
        <>
        
        
        </>
    )
}

export default NewStudentPage;