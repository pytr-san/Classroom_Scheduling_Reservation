import axios from "axios";
import useAuth from "./useAuth";
import  axiosInstance  from './../axios.jsx';

const useRefreshToken = () => {

    const { setAuth } = useAuth();
    const refresh = async () => {
        const response = await axiosInstance.get('/auth/refresh-token')
        setAuth(prev =>{
            console.log(JSON.stringify(prev));
            console.log(response.data.token)
            return { ...prev, token: response.data.token}
        })
        return response.data.token;
}

    return refresh;
}

export default useRefreshToken;