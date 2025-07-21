import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

export const decodeAndSetConfig = (setConfig) => {
    try {
        const token = Cookies.get('token');
        if (!token) {
            return;
        }
        const decodedToken = jwtDecode(token);
        setConfig(decodedToken);
    } catch (error) {
        console.error("Error decoding token", error);
    }
};

export const getTokenValues = () => {
    try {
        const token = Cookies.get('token');
        if (!token) {
            return;
        }
        const decodedToken = jwtDecode(token);
        return decodedToken;
    } catch (error) {
        console.error("Error decoding token", error);
    }
};