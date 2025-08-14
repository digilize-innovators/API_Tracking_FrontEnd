import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import Cookies from 'js-cookie';
import { api } from '../utils/Rest-API';
import { jwtDecode } from 'jwt-decode';
import PropTypes from 'prop-types';
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState('');
  const [userData, setUserData] = useState({});

  useEffect(() => {
    const token = Cookies.get('token');
    setUser(token);
  }, []);

  const setUserInfo = (data) => {
    setUserData(data);
    Cookies.set('userName', data.userName);
    Cookies.set('departmentName', data.departmentName);
  };

  const getUserData = () => {
    const profileImage=Cookies.get("profile-image");
    const userName = Cookies.get('userName');
    const userLocation=Cookies.get('location');
    const departmentName = Cookies.get('departmentName');
    return { userName, departmentName,profileImage ,userLocation};
  };

  const login = (token) => {
    setUser(token);
    Cookies.set('token', token);
  };

  const logout = async () => {
    const data = {};
    const token = Cookies.get('token');

    if (token) {
      const decodedToken = jwtDecode(token);
      const config = decodedToken.config.audit_logs;
      const audit_log = {
        audit_log: config,
        performed_action: 'logout',
        remarks: 'user logged out',
      };
      data.audit_log = audit_log;

      try {
       await api('/auth/logout', data, 'post', true);

      } catch (error) {
        console.error("Error during logout:", error);
      }
    }
  };

  const removeAuthToken = () => {
    Cookies.remove('token');
    Cookies.remove('screens');
    Cookies.remove('userName');
    Cookies.remove('departmentName');
    Cookies.remove('showBot');
    Cookies.remove('location')
    setUser(null);
  };

  const contextValue = useMemo(() => ({
    getUserData,
    user,
    login,
    logout,
    setUserInfo,
    removeAuthToken,
  }), [user, userData]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => useContext(AuthContext);
