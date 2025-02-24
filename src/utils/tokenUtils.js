import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

export const decodeAndSetConfig = (setConfig) => {
    try {
        const token = Cookies.get('token');
        if (!token) {
            // console.error("Error decoding token");
            return;
        }
        const decodedToken = jwtDecode(token);
        setConfig(decodedToken);
    } catch (error) {
        console.error("Error decoding token", error);
    }
};